use axum::{extract::State, Json};

use crate::error::ApiError;
use crate::gas::{GasAnalysisRequest, GasProfile};
use crate::AppState;

pub async fn analyze_gas(
    State(state): State<AppState>,
    Json(request): Json<GasAnalysisRequest>,
) -> Result<Json<GasProfile>, ApiError> {
    tracing::info!(
        "Analyzing gas for: {}::{}::{}",
        request.module_address,
        request.module_name,
        request.function_name
    );

    let profile = state.gas_analyzer.analyze(request).await?;

    tracing::info!(
        "Gas analysis completed: total_gas={}, suggestions={}",
        profile.total_gas,
        profile.suggestions.len()
    );

    Ok(Json(profile))
}
