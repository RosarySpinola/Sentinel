use axum::{extract::State, Json};

use crate::error::ApiError;
use crate::simulation::{SimulationRequest, SimulationResult};
use crate::AppState;

pub async fn simulate_transaction(
    State(state): State<AppState>,
    Json(request): Json<SimulationRequest>,
) -> Result<Json<SimulationResult>, ApiError> {
    tracing::info!(
        "Simulating transaction: {}::{}::{}",
        request.module_address,
        request.module_name,
        request.function_name
    );

    let result = state.simulation.execute(request).await?;

    tracing::info!(
        "Simulation completed: success={}, gas_used={}",
        result.success,
        result.gas_used
    );

    Ok(Json(result))
}
