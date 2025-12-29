use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize)]
pub struct TraceRequest {
    pub network: String,
    pub sender: String,
    pub module_address: String,
    pub module_name: String,
    pub function_name: String,
    #[serde(default)]
    pub type_args: Vec<String>,
    #[serde(default)]
    pub args: Vec<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize)]
pub struct TraceResult {
    pub success: bool,
    pub steps: Vec<ExecutionStep>,
    pub total_gas: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct ExecutionStep {
    pub step_number: u32,
    pub instruction: String,
    pub module_name: String,
    pub function_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub line_number: Option<u32>,
    pub gas_delta: u64,
    pub gas_total: u64,
    pub stack: Vec<StackFrame>,
    pub locals: Vec<LocalVariable>,
}

#[derive(Debug, Clone, Serialize)]
pub struct StackFrame {
    pub module_name: String,
    pub function_name: String,
    pub depth: u32,
}

#[derive(Debug, Clone, Serialize)]
pub struct LocalVariable {
    pub name: String,
    pub var_type: String,
    pub value: serde_json::Value,
}
