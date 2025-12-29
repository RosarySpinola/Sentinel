use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Internal error: {0}")]
    Internal(String),

    #[error("Simulation failed: {0}")]
    SimulationFailed(String),

    #[error("RPC error: {0}")]
    RpcError(String),

    #[error("Prover error: {0}")]
    ProverError(String),

    #[error("Prover timeout")]
    ProverTimeout,
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, error_message) = match &self {
            ApiError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            ApiError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.clone()),
            ApiError::Internal(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg.clone()),
            ApiError::SimulationFailed(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            ApiError::RpcError(msg) => (StatusCode::BAD_GATEWAY, msg.clone()),
            ApiError::ProverError(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            ApiError::ProverTimeout => (StatusCode::REQUEST_TIMEOUT, "Prover timed out".to_string()),
        };

        let body = Json(json!({
            "error": error_message,
            "code": status.as_u16(),
        }));

        (status, body).into_response()
    }
}

impl From<reqwest::Error> for ApiError {
    fn from(err: reqwest::Error) -> Self {
        ApiError::RpcError(err.to_string())
    }
}

impl From<serde_json::Error> for ApiError {
    fn from(err: serde_json::Error) -> Self {
        ApiError::Internal(format!("JSON error: {}", err))
    }
}
