use std::collections::HashMap;
use std::time::Instant;
use regex::Regex;
use tempfile::TempDir;
use tokio::process::Command;
use tokio::time::{timeout, Duration};

use super::types::{
    Counterexample, ModuleResult, ProverRequest, ProverResult, ProverStatus,
    SourceLocation, SpecResult,
};
use crate::error::ApiError;

// Use aptos-framework v1.0.0 which is compatible with Move Prover
// The mainnet branch uses Move 2.2 features not yet supported by the prover
const MOVE_TOML_TEMPLATE: &str = r#"[package]
name = "sentinel_verify"
version = "1.0.0"

[dependencies]
AptosFramework = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-framework", rev = "aptos-node-v1.8.0" }

[addresses]
sentinel_verify = "0x1"
"#;

// Minimal Move.toml for simple modules that don't need framework dependencies
const MOVE_TOML_MINIMAL: &str = r#"[package]
name = "sentinel_verify"
version = "1.0.0"

[addresses]
sentinel_verify = "0x1"
"#;

pub struct ProverExecutor;

impl ProverExecutor {
    pub fn new() -> Self {
        Self
    }

    pub async fn execute(&self, request: ProverRequest) -> Result<ProverResult, ApiError> {
        let start = Instant::now();
        let timeout_duration = Duration::from_secs(request.timeout_seconds as u64);

        // Create temp directory with Move project structure
        let temp_dir = self.create_temp_project(&request)?;
        let temp_path = temp_dir.path().to_path_buf();

        // Run the prover with timeout
        let result = timeout(
            timeout_duration,
            self.run_prover(&temp_path),
        )
        .await;

        let duration_ms = start.elapsed().as_millis() as u64;

        match result {
            Ok(Ok((stdout, stderr, exit_code))) => {
                let combined_output = format!("{}\n{}", stdout, stderr);
                self.parse_prover_output(
                    &combined_output,
                    exit_code,
                    duration_ms,
                    &request.module_name,
                )
            }
            Ok(Err(e)) => {
                // CLI execution failed
                Ok(ProverResult {
                    status: ProverStatus::Error,
                    duration_ms,
                    modules: vec![],
                    summary: format!("Prover execution failed: {}", e),
                    raw_output: Some(e.to_string()),
                })
            }
            Err(_) => {
                // Timeout
                Ok(ProverResult {
                    status: ProverStatus::Timeout,
                    duration_ms,
                    modules: vec![],
                    summary: format!("Prover timed out after {} seconds", request.timeout_seconds),
                    raw_output: None,
                })
            }
        }
    }

    fn create_temp_project(&self, request: &ProverRequest) -> Result<TempDir, ApiError> {
        let temp_dir = TempDir::new()
            .map_err(|e| ApiError::ProverError(format!("Failed to create temp directory: {}", e)))?;

        let base_path = temp_dir.path();

        // Create sources directory
        let sources_dir = base_path.join("sources");
        std::fs::create_dir_all(&sources_dir)
            .map_err(|e| ApiError::ProverError(format!("Failed to create sources dir: {}", e)))?;

        // Check if code uses framework imports - if not, use minimal Move.toml
        let needs_framework = request.move_code.contains("use aptos_framework::")
            || request.move_code.contains("use std::")
            || request.move_code.contains("use aptos_std::");

        let move_toml = if needs_framework {
            MOVE_TOML_TEMPLATE
        } else {
            MOVE_TOML_MINIMAL
        };

        // Write Move.toml
        std::fs::write(base_path.join("Move.toml"), move_toml)
            .map_err(|e| ApiError::ProverError(format!("Failed to write Move.toml: {}", e)))?;

        // Write the Move source file
        let source_file = sources_dir.join(format!("{}.move", request.module_name));
        std::fs::write(&source_file, &request.move_code)
            .map_err(|e| ApiError::ProverError(format!("Failed to write source file: {}", e)))?;

        Ok(temp_dir)
    }

    async fn run_prover(&self, project_path: &std::path::Path) -> Result<(String, String, i32), ApiError> {
        let output = Command::new("aptos")
            .args(["move", "prove", "--package-dir"])
            .arg(project_path)
            .output()
            .await
            .map_err(|e| {
                if e.kind() == std::io::ErrorKind::NotFound {
                    ApiError::ProverError("aptos CLI not found. Please install the Aptos CLI.".to_string())
                } else {
                    ApiError::ProverError(format!("Failed to execute prover: {}", e))
                }
            })?;

        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        let exit_code = output.status.code().unwrap_or(-1);

        Ok((stdout, stderr, exit_code))
    }

    fn parse_prover_output(
        &self,
        output: &str,
        exit_code: i32,
        duration_ms: u64,
        module_name: &str,
    ) -> Result<ProverResult, ApiError> {
        // Check for SUCCESS - can be "SUCCESS" or "Result": "Success"
        let is_success = (output.contains("SUCCESS") || output.contains("\"Result\": \"Success\"")) && exit_code == 0;

        // Parse any errors or warnings
        let specs = self.parse_spec_results(output, module_name);

        let module_status = if is_success {
            ProverStatus::Passed
        } else if specs.iter().any(|s| s.status == ProverStatus::Failed) {
            ProverStatus::Failed
        } else {
            ProverStatus::Error
        };

        let overall_status = module_status.clone();

        let summary = if is_success {
            format!("Module {} verified successfully", module_name)
        } else {
            let failed_count = specs.iter().filter(|s| s.status == ProverStatus::Failed).count();
            if failed_count > 0 {
                format!("Module {} verification failed: {} spec(s) failed", module_name, failed_count)
            } else {
                format!("Module {} verification failed with errors", module_name)
            }
        };

        Ok(ProverResult {
            status: overall_status,
            duration_ms,
            modules: vec![ModuleResult {
                name: module_name.to_string(),
                status: module_status,
                specs,
                invariants: vec![],
            }],
            summary,
            raw_output: Some(output.to_string()),
        })
    }

    fn parse_spec_results(&self, output: &str, module_name: &str) -> Vec<SpecResult> {
        let mut specs = Vec::new();

        // Pattern for errors like:
        // error: post-condition does not hold
        //    ┌─ /tmp/test/sources/test.move:15:9
        // 15 │         ensures result <= reserve_b;
        let error_pattern = Regex::new(
            r"error:\s*([^\n]+)\n\s*┌─\s*[^:]+:(\d+):\d+\n[^│]*│\s*(.+)"
        ).ok();

        // Pattern for counterexamples like:
        //    = at line 8: x = 18446744073709551615
        let counterexample_pattern = Regex::new(
            r"=\s*at line (\d+):\s*(.+)"
        ).ok();

        // Find all error matches
        if let Some(pattern) = &error_pattern {
            for cap in pattern.captures_iter(output) {
                let error_message = cap.get(1).map(|m| m.as_str()).unwrap_or("");
                let line_num = cap.get(2).and_then(|m| m.as_str().parse().ok());
                let failed_code = cap.get(3).map(|m| m.as_str().trim()).unwrap_or("");

                // Try to extract function name from ensures/requires
                let function_name = self.extract_function_name(output, line_num.unwrap_or(0));

                // Look for counterexample after this error
                let counterexample = counterexample_pattern.as_ref().and_then(|ce_pattern| {
                    ce_pattern.captures(output).map(|ce_cap| {
                        let trace_line = ce_cap.get(1).and_then(|m| m.as_str().parse().ok()).unwrap_or(0);
                        let assignment = ce_cap.get(2).map(|m| m.as_str()).unwrap_or("");

                        let mut inputs = HashMap::new();
                        // Parse simple assignments like "x = 123"
                        if let Some((var, val)) = assignment.split_once('=') {
                            inputs.insert(
                                var.trim().to_string(),
                                serde_json::Value::String(val.trim().to_string()),
                            );
                        }

                        Counterexample {
                            inputs,
                            trace: vec![format!("at line {}: {}", trace_line, assignment)],
                            failed_assertion: failed_code.to_string(),
                        }
                    })
                });

                specs.push(SpecResult {
                    name: format!("spec_{}", specs.len() + 1),
                    function: function_name,
                    status: ProverStatus::Failed,
                    location: Some(SourceLocation {
                        module: module_name.to_string(),
                        function: "".to_string(),
                        line: line_num,
                    }),
                    counterexample,
                    message: Some(error_message.to_string()),
                });
            }
        }

        // If no errors found and output shows SUCCESS, add a passed spec
        if specs.is_empty() && output.contains("SUCCESS") {
            specs.push(SpecResult {
                name: "all_specs".to_string(),
                function: "all".to_string(),
                status: ProverStatus::Passed,
                location: None,
                counterexample: None,
                message: Some("All specifications verified".to_string()),
            });
        }

        specs
    }

    fn extract_function_name(&self, output: &str, near_line: u32) -> String {
        // Try to find function name near the error line
        let fn_pattern = Regex::new(r"(?:public\s+)?fun\s+(\w+)").ok();

        if let Some(pattern) = fn_pattern {
            // Simple heuristic: find the first function name in output
            if let Some(cap) = pattern.captures(output) {
                return cap.get(1).map(|m| m.as_str().to_string()).unwrap_or_default();
            }
        }

        format!("function_at_line_{}", near_line)
    }
}

impl Default for ProverExecutor {
    fn default() -> Self {
        Self::new()
    }
}
