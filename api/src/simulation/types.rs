use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize)]
pub struct SimulationRequest {
    pub network: String,
    pub sender: String,
    pub module_address: String,
    pub module_name: String,
    pub function_name: String,
    #[serde(default)]
    pub type_args: Vec<String>,
    #[serde(default)]
    pub args: Vec<serde_json::Value>,
    #[serde(default = "default_max_gas")]
    pub max_gas: u64,
    /// If true, use the /v1/view endpoint (no signature needed)
    /// If false, use /v1/transactions/simulate (requires auth for entry functions)
    #[serde(default)]
    pub is_view: bool,
    /// Optional public key for entry function simulation
    /// Required for entry functions on Movement Network which validates auth
    #[serde(default)]
    pub public_key: Option<String>,
}

fn default_max_gas() -> u64 {
    100_000
}

#[derive(Debug, Clone, Serialize)]
pub struct SimulationResult {
    pub success: bool,
    pub gas_used: u64,
    pub gas_unit_price: u64,
    pub vm_status: String,
    pub state_changes: Vec<StateChange>,
    pub events: Vec<SimEvent>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<SimulationError>,
}

#[derive(Debug, Clone, Serialize)]
pub struct StateChange {
    pub address: String,
    pub resource: String,
    pub change_type: ChangeType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub before: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub after: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ChangeType {
    Write,
    Delete,
    Create,
}

#[derive(Debug, Clone, Serialize)]
pub struct SimEvent {
    pub r#type: String,
    pub data: serde_json::Value,
    pub sequence_number: u64,
}

#[derive(Debug, Clone, Serialize)]
pub struct SimulationError {
    pub code: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub location: Option<SourceLocation>,
}

#[derive(Debug, Clone, Serialize)]
pub struct SourceLocation {
    pub module: String,
    pub function: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub line: Option<u32>,
}

// Batch simulation types for CI/CD integration

#[derive(Debug, Clone, Deserialize)]
pub struct BatchSimulationRequest {
    pub network: String,
    pub scenarios: Vec<SimulationScenario>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SimulationScenario {
    pub name: String,
    pub sender: String,
    pub module_address: String,
    pub module_name: String,
    pub function_name: String,
    #[serde(default)]
    pub type_args: Vec<String>,
    #[serde(default)]
    pub args: Vec<serde_json::Value>,
    pub max_gas: Option<u64>,
    pub expect_success: Option<bool>,
    pub expect_error: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct BatchSimulationResult {
    pub total: u32,
    pub passed: u32,
    pub failed: u32,
    pub results: Vec<ScenarioResult>,
    pub max_gas_used: u64,
    pub summary: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ScenarioResult {
    pub name: String,
    pub passed: bool,
    pub gas_used: u64,
    pub expected_success: Option<bool>,
    pub actual_success: bool,
    pub expected_error: Option<String>,
    pub actual_error: Option<String>,
    pub failure_reason: Option<String>,
}
