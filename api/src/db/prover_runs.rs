//! Prover run database operations

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use sqlx::FromRow;
use uuid::Uuid;

use super::DbPool;

/// Prover run model
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ProverRun {
    pub id: Uuid,
    pub project_id: Option<Uuid>,
    pub user_id: Option<Uuid>,
    pub module_name: String,
    pub move_code: String,
    pub status: String,
    pub duration_ms: Option<i64>,
    pub result: JsonValue,
    pub created_at: DateTime<Utc>,
}

/// Create prover run input
#[derive(Debug, Deserialize)]
pub struct CreateProverRun {
    pub project_id: Option<Uuid>,
    pub module_name: String,
    pub move_code: String,
    pub status: String,
    pub duration_ms: Option<i64>,
    pub result: JsonValue,
}

/// Create a new prover run record
pub async fn create_prover_run(pool: &DbPool, user_id: Option<Uuid>, input: CreateProverRun) -> Result<ProverRun, sqlx::Error> {
    sqlx::query_as::<_, ProverRun>(
        r#"
        INSERT INTO prover_runs (project_id, user_id, module_name, move_code, status, duration_ms, result)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        "#,
    )
    .bind(input.project_id)
    .bind(user_id)
    .bind(&input.module_name)
    .bind(&input.move_code)
    .bind(&input.status)
    .bind(input.duration_ms)
    .bind(&input.result)
    .fetch_one(pool)
    .await
}

/// Get prover run by ID
pub async fn get_prover_run_by_id(pool: &DbPool, id: Uuid) -> Result<Option<ProverRun>, sqlx::Error> {
    sqlx::query_as::<_, ProverRun>("SELECT * FROM prover_runs WHERE id = $1")
        .bind(id)
        .fetch_optional(pool)
        .await
}

/// List prover runs for a user
pub async fn list_user_prover_runs(
    pool: &DbPool,
    user_id: Uuid,
    limit: i64,
    offset: i64,
) -> Result<Vec<ProverRun>, sqlx::Error> {
    sqlx::query_as::<_, ProverRun>(
        r#"
        SELECT * FROM prover_runs
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
        "#,
    )
    .bind(user_id)
    .bind(limit)
    .bind(offset)
    .fetch_all(pool)
    .await
}

/// List prover runs for a project
pub async fn list_project_prover_runs(
    pool: &DbPool,
    project_id: Uuid,
    limit: i64,
    offset: i64,
) -> Result<Vec<ProverRun>, sqlx::Error> {
    sqlx::query_as::<_, ProverRun>(
        r#"
        SELECT * FROM prover_runs
        WHERE project_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
        "#,
    )
    .bind(project_id)
    .bind(limit)
    .bind(offset)
    .fetch_all(pool)
    .await
}

/// Count prover runs for a user
pub async fn count_user_prover_runs(pool: &DbPool, user_id: Uuid) -> Result<i64, sqlx::Error> {
    let result: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM prover_runs WHERE user_id = $1")
        .bind(user_id)
        .fetch_one(pool)
        .await?;
    Ok(result.0)
}

/// Get prover run stats
#[derive(Debug, Serialize)]
pub struct ProverRunStats {
    pub total: i64,
    pub passed: i64,
    pub failed: i64,
    pub timeout: i64,
    pub error: i64,
}

pub async fn get_prover_run_stats(pool: &DbPool, user_id: Uuid) -> Result<ProverRunStats, sqlx::Error> {
    let total = count_user_prover_runs(pool, user_id).await?;

    let passed: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM prover_runs WHERE user_id = $1 AND status = 'passed'"
    )
    .bind(user_id)
    .fetch_one(pool)
    .await?;

    let failed: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM prover_runs WHERE user_id = $1 AND status = 'failed'"
    )
    .bind(user_id)
    .fetch_one(pool)
    .await?;

    let timeout: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM prover_runs WHERE user_id = $1 AND status = 'timeout'"
    )
    .bind(user_id)
    .fetch_one(pool)
    .await?;

    let error: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM prover_runs WHERE user_id = $1 AND status = 'error'"
    )
    .bind(user_id)
    .fetch_one(pool)
    .await?;

    Ok(ProverRunStats {
        total,
        passed: passed.0,
        failed: failed.0,
        timeout: timeout.0,
        error: error.0,
    })
}
