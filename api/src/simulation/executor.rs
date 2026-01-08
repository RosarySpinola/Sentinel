use super::types::{
    BatchSimulationRequest, BatchSimulationResult, ChangeType, ScenarioResult, SimEvent,
    SimulationRequest, SimulationResult, SimulationScenario, StateChange,
};
use crate::config::Config;
use crate::error::ApiError;

pub struct SimulationExecutor {
    http_client: reqwest::Client,
    config: Config,
}

impl SimulationExecutor {
    pub fn new(config: Config) -> Self {
        Self {
            http_client: reqwest::Client::new(),
            config,
        }
    }

    /// Fetch the authentication key for an account from the chain.
    /// Returns None if the account doesn't exist or on any error.
    async fn get_account_auth_key(&self, rpc_url: &str, address: &str) -> Option<String> {
        let url = format!("{}/accounts/{}", rpc_url, address);

        let response = self.http_client
            .get(&url)
            .send()
            .await
            .ok()?;

        if !response.status().is_success() {
            return None;
        }

        let account_data: serde_json::Value = response.json().await.ok()?;

        // The authentication_key is in the account resource
        // For ed25519, the auth key is sha3-256(public_key || 0x00)
        // We need to use the auth key as a proxy since we don't have the actual public key
        account_data
            .get("authentication_key")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
    }

    pub async fn execute(&self, request: SimulationRequest) -> Result<SimulationResult, ApiError> {
        let rpc_url = self.config.get_rpc_url(&request.network);

        // First, try to get the account's authentication key to use the correct public key
        let auth_key = self.get_account_auth_key(&rpc_url, &request.sender).await;

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

        // Use the account's auth key as the public key if available.
        // For ed25519, the auth key IS the public key (with scheme byte stripped).
        // If we can't get it, fall back to a dummy key (simulation may fail with auth error).
        let public_key = auth_key.unwrap_or_else(|| {
            "0x0000000000000000000000000000000000000000000000000000000000000000".to_string()
        });

        let dummy_signature = serde_json::json!({
            "type": "ed25519_signature",
            "public_key": public_key,
            "signature": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        });

        // Build the simulation request body
        let body = serde_json::json!({
            "sender": request.sender,
            "sequence_number": "0",
            "max_gas_amount": request.max_gas.to_string(),
            "gas_unit_price": "100",
            "expiration_timestamp_secs": (chrono::Utc::now().timestamp() + 600).to_string(),
            "payload": payload,
            "signature": dummy_signature,
        });

        // Make the simulation request with query params for gas estimation
        let response = self
            .http_client
            .post(format!(
                "{}/transactions/simulate?estimate_gas_unit_price=true&estimate_max_gas_amount=true",
                rpc_url
            ))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            return Err(ApiError::SimulationFailed(error_text));
        }

        let result: Vec<serde_json::Value> = response.json().await?;
        let tx_result = result.first().ok_or_else(|| {
            ApiError::SimulationFailed("Empty response from simulation".to_string())
        })?;

        self.parse_simulation_result(tx_result)
    }

    fn parse_simulation_result(&self, result: &serde_json::Value) -> Result<SimulationResult, ApiError> {
        let success = result.get("success")
            .and_then(|v| v.as_bool())
            .unwrap_or(false);

        let gas_used = result.get("gas_used")
            .and_then(|v| v.as_str())
            .and_then(|s| s.parse().ok())
            .unwrap_or(0);

        let gas_unit_price = result.get("gas_unit_price")
            .and_then(|v| v.as_str())
            .and_then(|s| s.parse().ok())
            .unwrap_or(100);

        let vm_status = result.get("vm_status")
            .and_then(|v| v.as_str())
            .unwrap_or("Unknown")
            .to_string();

        // Parse state changes from write set
        let state_changes = self.parse_state_changes(result);

        // Parse events
        let events = self.parse_events(result);

        let error = if !success {
            Some(super::types::SimulationError {
                code: "EXECUTION_FAILED".to_string(),
                message: vm_status.clone(),
                location: None,
            })
        } else {
            None
        };

        Ok(SimulationResult {
            success,
            gas_used,
            gas_unit_price,
            vm_status,
            state_changes,
            events,
            error,
        })
    }

    fn parse_state_changes(&self, result: &serde_json::Value) -> Vec<StateChange> {
        let changes = result.get("changes")
            .and_then(|v| v.as_array())
            .cloned()
            .unwrap_or_default();

        changes.iter().filter_map(|change| {
            let change_type = change.get("type")?.as_str()?;
            let address = change.get("address")?.as_str()?.to_string();

            match change_type {
                "write_resource" => {
                    let resource = change.get("data")
                        .and_then(|d| d.get("type"))
                        .and_then(|t| t.as_str())
                        .unwrap_or("unknown")
                        .to_string();
                    let data = change.get("data")
                        .and_then(|d| d.get("data"))
                        .cloned();

                    Some(StateChange {
                        address,
                        resource,
                        change_type: ChangeType::Write,
                        before: None,
                        after: data,
                    })
                }
                "delete_resource" => {
                    let resource = change.get("resource")?.as_str()?.to_string();
                    Some(StateChange {
                        address,
                        resource,
                        change_type: ChangeType::Delete,
                        before: None,
                        after: None,
                    })
                }
                _ => None,
            }
        }).collect()
    }

    fn parse_events(&self, result: &serde_json::Value) -> Vec<SimEvent> {
        let events = result.get("events")
            .and_then(|v| v.as_array())
            .cloned()
            .unwrap_or_default();

        events.iter().filter_map(|event| {
            let event_type = event.get("type")?.as_str()?.to_string();
            let data = event.get("data")?.clone();
            let sequence_number = event.get("sequence_number")
                .and_then(|v| v.as_str())
                .and_then(|s| s.parse().ok())
                .unwrap_or(0);

            Some(SimEvent {
                r#type: event_type,
                data,
                sequence_number,
            })
        }).collect()
    }

    pub async fn execute_batch(
        &self,
        request: BatchSimulationRequest,
    ) -> Result<BatchSimulationResult, ApiError> {
        let mut results = vec![];
        let mut passed = 0u32;
        let mut failed = 0u32;
        let mut max_gas = 0u64;

        for scenario in request.scenarios {
            let sim_request = SimulationRequest {
                network: request.network.clone(),
                sender: scenario.sender.clone(),
                module_address: scenario.module_address.clone(),
                module_name: scenario.module_name.clone(),
                function_name: scenario.function_name.clone(),
                type_args: scenario.type_args.clone(),
                args: scenario.args.clone(),
                max_gas: scenario.max_gas.unwrap_or(100_000),
            };

            let sim_result = self.execute(sim_request).await;
            let scenario_result = self.evaluate_scenario(&scenario, sim_result);

            if scenario_result.passed {
                passed += 1;
            } else {
                failed += 1;
            }

            max_gas = max_gas.max(scenario_result.gas_used);
            results.push(scenario_result);
        }

        let total = results.len() as u32;
        Ok(BatchSimulationResult {
            total,
            passed,
            failed,
            results,
            max_gas_used: max_gas,
            summary: format!("{}/{} scenarios passed", passed, total),
        })
    }

    fn evaluate_scenario(
        &self,
        scenario: &SimulationScenario,
        result: Result<SimulationResult, ApiError>,
    ) -> ScenarioResult {
        match result {
            Ok(sim) => {
                let mut passed = true;
                let mut failure_reason = None;

                // Check success expectation
                if let Some(expect_success) = scenario.expect_success {
                    if sim.success != expect_success {
                        passed = false;
                        failure_reason = Some(format!(
                            "Expected success={}, got {}",
                            expect_success, sim.success
                        ));
                    }
                }

                // Check error expectation
                if let Some(ref expect_error) = scenario.expect_error {
                    if let Some(ref error) = sim.error {
                        if !error.message.contains(expect_error) {
                            passed = false;
                            failure_reason = Some(format!(
                                "Expected error containing '{}', got '{}'",
                                expect_error, error.message
                            ));
                        }
                    } else {
                        passed = false;
                        failure_reason = Some(format!(
                            "Expected error '{}', but succeeded",
                            expect_error
                        ));
                    }
                }

                ScenarioResult {
                    name: scenario.name.clone(),
                    passed,
                    gas_used: sim.gas_used,
                    expected_success: scenario.expect_success,
                    actual_success: sim.success,
                    expected_error: scenario.expect_error.clone(),
                    actual_error: sim.error.map(|e| e.message),
                    failure_reason,
                }
            }
            Err(e) => ScenarioResult {
                name: scenario.name.clone(),
                passed: false,
                gas_used: 0,
                expected_success: scenario.expect_success,
                actual_success: false,
                expected_error: scenario.expect_error.clone(),
                actual_error: Some(e.to_string()),
                failure_reason: Some(format!("Simulation error: {}", e)),
            },
        }
    }
}
