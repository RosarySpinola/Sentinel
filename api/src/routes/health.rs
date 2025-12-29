use axum::{extract::State, Json};
use redis::AsyncCommands;
use serde::Serialize;
use serde_json::{json, Value};
use sqlx::Row;
use std::time::Instant;

use crate::AppState;

static START_TIME: std::sync::OnceLock<Instant> = std::sync::OnceLock::new();

/// Get the startup time, initializing it if needed
fn get_start_time() -> &'static Instant {
    START_TIME.get_or_init(Instant::now)
}

#[derive(Serialize)]
struct DependencyStatus {
    database: String,
    redis: String,
}

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    version: String,
    uptime_seconds: u64,
    dependencies: DependencyStatus,
}

/// Health check endpoint that verifies all dependencies
pub async fn health_check(State(state): State<AppState>) -> Json<Value> {
    let start_time = get_start_time();
    let uptime = start_time.elapsed().as_secs();

    // Check database connection
    let db_status = match sqlx::query("SELECT 1").fetch_one(&state.db).await {
        Ok(_) => "connected".to_string(),
        Err(e) => format!("error: {}", e),
    };

    // Check Redis connection
    let redis_status = match &state.redis {
        Some(pool) => {
            let mut conn = pool.lock().await;
            match redis::cmd("PING")
                .query_async::<String>(&mut *conn)
                .await
            {
                Ok(_) => "connected".to_string(),
                Err(e) => format!("error: {}", e),
            }
        }
        None => "disabled".to_string(),
    };

    // Determine overall status
    let is_healthy = db_status == "connected";
    let status = if is_healthy { "healthy" } else { "unhealthy" };

    Json(json!({
        "status": status,
        "version": env!("CARGO_PKG_VERSION"),
        "uptime_seconds": uptime,
        "dependencies": {
            "database": db_status,
            "redis": redis_status
        }
    }))
}

/// Simple liveness probe for container orchestration
pub async fn liveness() -> Json<Value> {
    Json(json!({ "status": "alive" }))
}

/// Readiness probe that checks if the service can handle requests
pub async fn readiness(State(state): State<AppState>) -> Json<Value> {
    // Check database is ready
    let db_ready = sqlx::query("SELECT 1").fetch_one(&state.db).await.is_ok();

    if db_ready {
        Json(json!({ "status": "ready" }))
    } else {
        Json(json!({ "status": "not_ready", "reason": "database unavailable" }))
    }
}
