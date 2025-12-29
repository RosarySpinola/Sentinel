use axum::{extract::State, Json};

use crate::error::ApiError;
use crate::simulation::{BatchSimulationRequest, BatchSimulationResult};
use crate::AppState;

pub async fn simulate_batch(
    State(state): State<AppState>,
    Json(request): Json<BatchSimulationRequest>,
) -> Result<Json<BatchSimulationResult>, ApiError> {
    tracing::info!(
        "Running batch simulation: {} scenarios on {}",
        request.scenarios.len(),
        request.network
    );

    let result = state.simulation.execute_batch(request).await?;

    tracing::info!(
        "Batch simulation completed: {}/{} passed, max_gas={}",
        result.passed,
        result.total,
        result.max_gas_used
    );

    Ok(Json(result))
}
