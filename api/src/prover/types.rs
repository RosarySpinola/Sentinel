use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize)]
pub struct ProverRequest {
    pub move_code: String,
    pub module_name: String,
    #[serde(default)]
    pub specs: Vec<String>,
    #[serde(default = "default_timeout")]
    pub timeout_seconds: u32,
}

fn default_timeout() -> u32 {
    60
}

#[derive(Debug, Clone, Serialize)]
pub struct ProverResult {
    pub status: ProverStatus,
    pub duration_ms: u64,
    pub modules: Vec<ModuleResult>,
    pub summary: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub raw_output: Option<String>,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ProverStatus {
    Passed,
    Failed,
    Timeout,
    Error,
}

#[derive(Debug, Clone, Serialize)]
pub struct ModuleResult {
    pub name: String,
    pub status: ProverStatus,
    pub specs: Vec<SpecResult>,
    pub invariants: Vec<InvariantResult>,
}

#[derive(Debug, Clone, Serialize)]
pub struct SpecResult {
    pub name: String,
    pub function: String,
    pub status: ProverStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub location: Option<SourceLocation>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub counterexample: Option<Counterexample>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct InvariantResult {
    pub name: String,
    pub status: ProverStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub violated_at: Option<SourceLocation>,
}

#[derive(Debug, Clone, Serialize)]
pub struct SourceLocation {
    pub module: String,
    pub function: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub line: Option<u32>,
}

#[derive(Debug, Clone, Serialize)]
pub struct Counterexample {
    pub inputs: std::collections::HashMap<String, serde_json::Value>,
    pub trace: Vec<String>,
    pub failed_assertion: String,
}
