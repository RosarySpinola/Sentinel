use crate::config::Config;
use crate::error::ApiError;
use crate::simulation::SimulationResult;

use super::parser::parse_simulation_result;
use super::suggestions::generate_suggestions;
use super::timeline::create_timeline;
use super::types::{
    FunctionGas, GasAnalysisRequest, GasProfile, Hotspot, OperationGas,
};

pub struct GasAnalyzer {
    http_client: reqwest::Client,
    config: Config,
}

impl GasAnalyzer {
    pub fn new(config: Config) -> Self {
        Self {
            http_client: reqwest::Client::new(),
            config,
        }
    }

    /// Build a GET request with Shinami API key header if configured
    fn build_get(&self, url: &str) -> reqwest::RequestBuilder {
        let mut req = self.http_client.get(url);
        if let Some(api_key) = self.config.get_shinami_api_key() {
            req = req.header("X-Api-Key", api_key);
        }
        req
    }

    /// Build a POST request with Shinami API key header if configured
    fn build_post(&self, url: &str) -> reqwest::RequestBuilder {
        let mut req = self.http_client.post(url);
        if let Some(api_key) = self.config.get_shinami_api_key() {
            req = req.header("X-Api-Key", api_key);
        }
        req
    }

    /// Get account sequence number for simulation
    async fn get_account_sequence(&self, rpc_url: &str, address: &str) -> String {
        let account_url = format!("{}/accounts/{}", rpc_url, address);

        let response = match self.build_get(&account_url).send().await {
            Ok(r) => r,
            Err(_) => return "0".to_string(),
        };

        if !response.status().is_success() {
            return "0".to_string();
        }

        let account_info: serde_json::Value = match response.json().await {
            Ok(v) => v,
            Err(_) => return "0".to_string(),
        };

        account_info.get("sequence_number")
            .and_then(|v| v.as_str())
            .unwrap_or("0")
            .to_string()
    }

    pub async fn analyze(&self, request: GasAnalysisRequest) -> Result<GasProfile, ApiError> {
        // 1. Run simulation to get base results
        let sim_result = self.run_simulation(&request).await?;

        // 2. Analyze gas breakdown by operation type
        let by_operation = self.analyze_operations(&sim_result);

        // 3. Analyze gas by function
        let by_function = self.analyze_functions(&request, &sim_result);

        // 4. Generate optimization suggestions
        let suggestions = generate_suggestions(sim_result.gas_used, &by_operation);

        // 5. Create step timeline for visualization
        let steps = create_timeline(&sim_result, &by_operation);

        Ok(GasProfile {
            total_gas: sim_result.gas_used,
            by_operation,
            by_function,
            suggestions,
            steps,
        })
    }

    async fn run_simulation(&self, request: &GasAnalysisRequest) -> Result<SimulationResult, ApiError> {
        let rpc_url = self.config.get_rpc_url(&request.network);

        // Normalize sender address
        let sender_normalized = if request.sender.starts_with("0x") {
            request.sender.clone()
        } else {
            format!("0x{}", request.sender)
        };

        // Get sequence number from account
        let sequence_number = self.get_account_sequence(&rpc_url, &sender_normalized).await;

        // Convert numeric arguments to strings (Movement/Aptos API requires this)
        let stringified_args: Vec<serde_json::Value> = request.args.iter().map(|arg| {
            match arg {
                serde_json::Value::Number(n) => serde_json::Value::String(n.to_string()),
                other => other.clone(),
            }
        }).collect();

        let payload = serde_json::json!({
            "type": "entry_function_payload",
            "function": format!(
                "{}::{}::{}",
                request.module_address,
                request.module_name,
                request.function_name
            ),
            "type_arguments": request.type_args,
            "arguments": stringified_args,
        });

        // Use the sender address as the public key for simulation
        // With skip_auth_key_validation=true, this should work
        let dummy_signature = serde_json::json!({
            "type": "ed25519_signature",
            "public_key": sender_normalized,
            "signature": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        });

        let body = serde_json::json!({
            "sender": sender_normalized,
            "sequence_number": sequence_number,
            "max_gas_amount": request.max_gas.to_string(),
            "gas_unit_price": "100",
            "expiration_timestamp_secs": (chrono::Utc::now().timestamp() + 600).to_string(),
            "payload": payload,
            "signature": dummy_signature,
        });

        // Use skip_auth_key_validation to allow simulation with dummy signature
        let url = format!(
            "{}/transactions/simulate?estimate_gas_unit_price=true&estimate_prioritized_gas_unit_price=false&skip_auth_key_validation=true",
            rpc_url
        );
        tracing::info!("Simulation URL: {}", url);
        tracing::debug!("Simulation body: {}", serde_json::to_string_pretty(&body).unwrap_or_default());

        let response = self
            .build_post(&url)
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            tracing::error!("Simulation failed with status {}: {}", status, error_text);
            return Err(ApiError::SimulationFailed(error_text));
        }

        let result: Vec<serde_json::Value> = response.json().await?;
        let tx_result = result.first().ok_or_else(|| {
            ApiError::SimulationFailed("Empty response from simulation".to_string())
        })?;

        parse_simulation_result(tx_result)
    }

    fn analyze_operations(&self, sim_result: &SimulationResult) -> Vec<OperationGas> {
        let mut operations: Vec<OperationGas> = Vec::new();
        let total_gas = sim_result.gas_used.max(1);

        // Estimate gas based on state changes (storage operations)
        let write_count = sim_result.state_changes.len() as u32;
        if write_count > 0 {
            let storage_gas = (write_count as u64) * 1000;
            operations.push(OperationGas {
                operation: "Storage Write".to_string(),
                count: write_count,
                total_gas: storage_gas.min(total_gas / 2),
                percentage: (storage_gas.min(total_gas / 2) as f64 / total_gas as f64) * 100.0,
            });
        }

        // Estimate gas for events
        let event_count = sim_result.events.len() as u32;
        if event_count > 0 {
            let event_gas = (event_count as u64) * 200;
            operations.push(OperationGas {
                operation: "Event Emission".to_string(),
                count: event_count,
                total_gas: event_gas.min(total_gas / 4),
                percentage: (event_gas.min(total_gas / 4) as f64 / total_gas as f64) * 100.0,
            });
        }

        // Add base execution gas (function calls, computation)
        let used_gas: u64 = operations.iter().map(|op| op.total_gas).sum();
        let remaining_gas = total_gas.saturating_sub(used_gas);

        if remaining_gas > 0 {
            let computation_gas = remaining_gas * 60 / 100;
            let call_gas = remaining_gas * 40 / 100;

            operations.push(OperationGas {
                operation: "Computation".to_string(),
                count: 1,
                total_gas: computation_gas,
                percentage: (computation_gas as f64 / total_gas as f64) * 100.0,
            });

            operations.push(OperationGas {
                operation: "Function Calls".to_string(),
                count: 1,
                total_gas: call_gas,
                percentage: (call_gas as f64 / total_gas as f64) * 100.0,
            });
        }

        operations.sort_by(|a, b| b.total_gas.cmp(&a.total_gas));
        operations
    }

    fn analyze_functions(
        &self,
        request: &GasAnalysisRequest,
        sim_result: &SimulationResult,
    ) -> Vec<FunctionGas> {
        let total_gas = sim_result.gas_used.max(1);

        let mut functions = vec![FunctionGas {
            module_name: request.module_name.clone(),
            function_name: request.function_name.clone(),
            gas_used: total_gas,
            percentage: 100.0,
            hotspots: self.identify_hotspots(sim_result),
        }];

        // Infer called modules from events
        for event in &sim_result.events {
            if let Some(module) = extract_module_from_type(&event.r#type) {
                if module != request.module_name {
                    let estimated_gas = total_gas * 5 / 100;
                    functions.push(FunctionGas {
                        module_name: module,
                        function_name: "emit".to_string(),
                        gas_used: estimated_gas,
                        percentage: (estimated_gas as f64 / total_gas as f64) * 100.0,
                        hotspots: vec![],
                    });
                }
            }
        }

        functions
    }

    fn identify_hotspots(&self, sim_result: &SimulationResult) -> Vec<Hotspot> {
        let mut hotspots = Vec::new();

        for (idx, change) in sim_result.state_changes.iter().enumerate() {
            hotspots.push(Hotspot {
                line: Some((idx + 1) as u32 * 10),
                gas: 1000,
                operation: format!("Storage write to {}", change.resource),
            });
        }

        for event in &sim_result.events {
            hotspots.push(Hotspot {
                line: None,
                gas: 200,
                operation: format!("Emit event {}", event.r#type),
            });
        }

        hotspots
    }
}

/// Extract module name from type string (e.g., "0x1::coin::CoinStore")
fn extract_module_from_type(type_str: &str) -> Option<String> {
    let parts: Vec<&str> = type_str.split("::").collect();
    if parts.len() >= 2 {
        Some(parts[1].to_string())
    } else {
        None
    }
}
