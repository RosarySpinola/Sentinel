use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize)]
pub struct GasAnalysisRequest {
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
}

fn default_max_gas() -> u64 {
    100_000
}

#[derive(Debug, Clone, Serialize)]
pub struct GasProfile {
    pub total_gas: u64,
    pub by_operation: Vec<OperationGas>,
    pub by_function: Vec<FunctionGas>,
    pub suggestions: Vec<GasSuggestion>,
    pub steps: Vec<GasStep>,
}

#[derive(Debug, Clone, Serialize)]
pub struct OperationGas {
    pub operation: String,
    pub count: u32,
    pub total_gas: u64,
    pub percentage: f64,
}

#[derive(Debug, Clone, Serialize)]
pub struct FunctionGas {
    pub module_name: String,
    pub function_name: String,
    pub gas_used: u64,
    pub percentage: f64,
    pub hotspots: Vec<Hotspot>,
}

#[derive(Debug, Clone, Serialize)]
pub struct Hotspot {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub line: Option<u32>,
    pub gas: u64,
    pub operation: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct GasSuggestion {
    pub severity: String, // "info", "warning", "critical"
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub location: Option<String>,
    pub estimated_savings: u64,
}

#[derive(Debug, Clone, Serialize)]
pub struct GasStep {
    pub step: u32,
    pub gas: u64,
    pub cumulative: u64,
    pub operation: String,
}
