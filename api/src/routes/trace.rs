use axum::{extract::State, Json};

use crate::error::ApiError;
use crate::trace::{TraceRequest, TraceResult};
use crate::AppState;

pub async fn get_trace(
    State(state): State<AppState>,
    Json(request): Json<TraceRequest>,
) -> Result<Json<TraceResult>, ApiError> {
    tracing::info!(
        "Getting trace for: {}::{}::{}",
        request.module_address,
        request.module_name,
        request.function_name
    );

    let result = state.trace.execute(request).await?;

    tracing::info!(
        "Trace completed: success={}, steps={}, total_gas={}",
        result.success,
        result.steps.len(),
        result.total_gas
    );

    Ok(Json(result))
}
