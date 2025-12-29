use axum::Json;

use crate::error::ApiError;
use crate::prover::{ProverExecutor, ProverRequest, ProverResult};

pub async fn run_prover(
    Json(request): Json<ProverRequest>,
) -> Result<Json<ProverResult>, ApiError> {
    tracing::info!("Running prover for module: {}", request.module_name);

    let executor = ProverExecutor::new();
    let result = executor.execute(request).await?;

    Ok(Json(result))
}
