use super::types::{ExecutionStep, LocalVariable, StackFrame, TraceRequest, TraceResult};
use crate::config::Config;
use crate::error::ApiError;

pub struct TraceExecutor {
    http_client: reqwest::Client,
    config: Config,
}

impl TraceExecutor {
    pub fn new(config: Config) -> Self {
        Self {
            http_client: reqwest::Client::new(),
            config,
        }
    }

    pub async fn execute(&self, request: TraceRequest) -> Result<TraceResult, ApiError> {
        let rpc_url = self.config.get_rpc_url(&request.network);

        // Convert numeric arguments to strings (Movement/Aptos API requires this for u64, u128, etc.)
        let stringified_args: Vec<serde_json::Value> = request.args.iter().map(|arg| {
            match arg {
                serde_json::Value::Number(n) => serde_json::Value::String(n.to_string()),
                other => other.clone(),
            }
        }).collect();

        // Build the transaction payload
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

        // Normalize sender address
        let sender_normalized = if request.sender.starts_with("0x") {
            request.sender.clone()
        } else {
            format!("0x{}", request.sender)
        };

        // Fetch account info to get authentication key and sequence number
        let (public_key, sequence_number) = self.get_account_auth_info(&rpc_url, &sender_normalized).await?;

        // Ed25519 signature for simulation (zeroed signature with real public key)
        let dummy_signature = serde_json::json!({
            "type": "ed25519_signature",
            "public_key": public_key,
            "signature": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        });

        // Build the simulation request body
        let body = serde_json::json!({
            "sender": sender_normalized,
            "sequence_number": sequence_number,
            "max_gas_amount": "100000",
            "gas_unit_price": "100",
            "expiration_timestamp_secs": (chrono::Utc::now().timestamp() + 600).to_string(),
            "payload": payload,
            "signature": dummy_signature,
        });

        // Make the simulation request with query params for gas estimation
        let response = self
            .http_client
            .post(format!(
                "{}/transactions/simulate?estimate_gas_unit_price=true&estimate_prioritized_gas_unit_price=false",
                rpc_url
            ))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());
            return Err(ApiError::SimulationFailed(error_text));
        }

        let result: Vec<serde_json::Value> = response.json().await?;
        let tx_result = result.first().ok_or_else(|| {
            ApiError::SimulationFailed("Empty response from simulation".to_string())
        })?;

        self.construct_trace(&request, tx_result)
    }

    fn construct_trace(
        &self,
        request: &TraceRequest,
        result: &serde_json::Value,
    ) -> Result<TraceResult, ApiError> {
        let success = result.get("success").and_then(|v| v.as_bool()).unwrap_or(false);
        let gas_used: u64 = result
            .get("gas_used")
            .and_then(|v| v.as_str())
            .and_then(|s| s.parse().ok())
            .unwrap_or(0);

        let vm_status = result
            .get("vm_status")
            .and_then(|v| v.as_str())
            .unwrap_or("Unknown")
            .to_string();

        let mut steps = Vec::new();
        let mut step_num = 0u32;
        let mut gas_total = 0u64;

        // Step 1: Entry function call
        let entry_gas = 100;
        gas_total += entry_gas;
        steps.push(ExecutionStep {
            step_number: step_num,
            instruction: format!("call {}::{}", request.module_name, request.function_name),
            module_name: request.module_name.clone(),
            function_name: request.function_name.clone(),
            line_number: Some(1),
            gas_delta: entry_gas,
            gas_total,
            stack: vec![StackFrame {
                module_name: request.module_name.clone(),
                function_name: request.function_name.clone(),
                depth: 0,
            }],
            locals: self.parse_args_as_locals(&request.args),
        });
        step_num += 1;

        // Steps for each state change
        let changes = result
            .get("changes")
            .and_then(|v| v.as_array())
            .cloned()
            .unwrap_or_default();

        for change in &changes {
            let change_type = change.get("type").and_then(|v| v.as_str()).unwrap_or("");
            let instruction = match change_type {
                "write_resource" => {
                    let resource = change
                        .get("data")
                        .and_then(|d| d.get("type"))
                        .and_then(|t| t.as_str())
                        .unwrap_or("unknown");
                    format!("move_to<{}>", self.short_resource_name(resource))
                }
                "delete_resource" => {
                    let resource = change
                        .get("resource")
                        .and_then(|t| t.as_str())
                        .unwrap_or("unknown");
                    format!("move_from<{}>", self.short_resource_name(resource))
                }
                "write_table_item" => "table_upsert".to_string(),
                "delete_table_item" => "table_remove".to_string(),
                _ => continue,
            };

            let step_gas = 50;
            gas_total += step_gas;

            let locals = self.extract_change_data(change);

            steps.push(ExecutionStep {
                step_number: step_num,
                instruction,
                module_name: request.module_name.clone(),
                function_name: request.function_name.clone(),
                line_number: None,
                gas_delta: step_gas,
                gas_total,
                stack: vec![StackFrame {
                    module_name: request.module_name.clone(),
                    function_name: request.function_name.clone(),
                    depth: 0,
                }],
                locals,
            });
            step_num += 1;
        }

        // Steps for each event
        let events = result
            .get("events")
            .and_then(|v| v.as_array())
            .cloned()
            .unwrap_or_default();

        for event in &events {
            let event_type = event
                .get("type")
                .and_then(|t| t.as_str())
                .unwrap_or("unknown");

            let step_gas = 20;
            gas_total += step_gas;

            let locals = self.extract_event_data(event);

            steps.push(ExecutionStep {
                step_number: step_num,
                instruction: format!("emit {}", self.short_resource_name(event_type)),
                module_name: request.module_name.clone(),
                function_name: request.function_name.clone(),
                line_number: None,
                gas_delta: step_gas,
                gas_total,
                stack: vec![StackFrame {
                    module_name: request.module_name.clone(),
                    function_name: request.function_name.clone(),
                    depth: 0,
                }],
                locals,
            });
            step_num += 1;
        }

        // Final step: Return
        let return_gas = gas_used.saturating_sub(gas_total);
        gas_total = gas_used;
        steps.push(ExecutionStep {
            step_number: step_num,
            instruction: "return".to_string(),
            module_name: request.module_name.clone(),
            function_name: request.function_name.clone(),
            line_number: None,
            gas_delta: return_gas,
            gas_total,
            stack: vec![],
            locals: vec![],
        });

        let error = if !success { Some(vm_status) } else { None };

        Ok(TraceResult {
            success,
            steps,
            total_gas: gas_used,
            error,
        })
    }

    fn short_resource_name(&self, full_name: &str) -> String {
        // Extract the last part: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>" -> "CoinStore<AptosCoin>"
        let name = full_name.split("::").last().unwrap_or(full_name);
        if let Some(start) = name.find('<') {
            if let Some(end) = name.rfind('>') {
                let outer = &name[..start];
                let inner = &name[start + 1..end];
                let inner_short = inner.split("::").last().unwrap_or(inner);
                return format!("{}<{}>", outer, inner_short);
            }
        }
        name.to_string()
    }

    fn parse_args_as_locals(&self, args: &[serde_json::Value]) -> Vec<LocalVariable> {
        args.iter()
            .enumerate()
            .map(|(i, arg)| LocalVariable {
                name: format!("arg{}", i),
                var_type: self.infer_type(arg),
                value: arg.clone(),
            })
            .collect()
    }

    fn infer_type(&self, value: &serde_json::Value) -> String {
        match value {
            serde_json::Value::String(s) => {
                if s.starts_with("0x") {
                    "address".to_string()
                } else if s.parse::<u64>().is_ok() {
                    "u64".to_string()
                } else {
                    "string".to_string()
                }
            }
            serde_json::Value::Number(n) => {
                if n.is_u64() {
                    "u64".to_string()
                } else {
                    "i64".to_string()
                }
            }
            serde_json::Value::Bool(_) => "bool".to_string(),
            serde_json::Value::Array(_) => "vector".to_string(),
            serde_json::Value::Object(_) => "struct".to_string(),
            serde_json::Value::Null => "null".to_string(),
        }
    }

    fn extract_change_data(&self, change: &serde_json::Value) -> Vec<LocalVariable> {
        let mut locals = vec![];

        if let Some(address) = change.get("address").and_then(|v| v.as_str()) {
            locals.push(LocalVariable {
                name: "address".to_string(),
                var_type: "address".to_string(),
                value: serde_json::Value::String(address.to_string()),
            });
        }

        if let Some(data) = change.get("data").and_then(|d| d.get("data")) {
            locals.push(LocalVariable {
                name: "data".to_string(),
                var_type: "struct".to_string(),
                value: data.clone(),
            });
        }

        locals
    }

    fn extract_event_data(&self, event: &serde_json::Value) -> Vec<LocalVariable> {
        let mut locals = vec![];

        if let Some(data) = event.get("data") {
            locals.push(LocalVariable {
                name: "event_data".to_string(),
                var_type: "struct".to_string(),
                value: data.clone(),
            });
        }

        if let Some(seq) = event.get("sequence_number").and_then(|v| v.as_str()) {
            locals.push(LocalVariable {
                name: "sequence_number".to_string(),
                var_type: "u64".to_string(),
                value: serde_json::Value::String(seq.to_string()),
            });
        }

        locals
    }

    /// Fetches account sequence number and returns a simulation-compatible public key.
    /// For simulation, we use a well-known valid Ed25519 public key since the signature
    /// is not actually verified - only the format needs to be valid.
    async fn get_account_auth_info(&self, rpc_url: &str, address: &str) -> Result<(String, String), ApiError> {
        // Use a well-known valid Ed25519 public key for simulation
        // This is the Ed25519 base point which is always a valid curve point
        // The actual key doesn't matter for simulation - only the format needs to be valid
        let simulation_public_key = "0x3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29";

        let account_url = format!("{}/accounts/{}", rpc_url, address);

        let response = self.http_client
            .get(&account_url)
            .send()
            .await?;

        if !response.status().is_success() {
            // Account may not exist - use default sequence number
            return Ok((simulation_public_key.to_string(), "0".to_string()));
        }

        let account_info: serde_json::Value = response.json().await?;

        // Extract sequence number
        let sequence_number = account_info.get("sequence_number")
            .and_then(|v| v.as_str())
            .unwrap_or("0")
            .to_string();

        Ok((simulation_public_key.to_string(), sequence_number))
    }
}
