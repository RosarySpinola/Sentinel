//! Simulation database operations

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use sqlx::FromRow;
use uuid::Uuid;

use super::DbPool;

/// Simulation model
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Simulation {
    pub id: Uuid,
    pub project_id: Option<Uuid>,
    pub user_id: Option<Uuid>,
    pub sender: String,
    pub module_address: String,
    pub module_name: String,
    pub function_name: String,
    pub args: Option<JsonValue>,
    pub type_args: Option<JsonValue>,
    pub result: JsonValue,
    pub success: bool,
    pub gas_used: Option<i64>,
    pub network: String,
    pub created_at: DateTime<Utc>,
}

/// Create simulation input
#[derive(Debug, Deserialize)]
pub struct CreateSimulation {
    pub project_id: Option<Uuid>,
    pub sender: String,
    pub module_address: String,
    pub module_name: String,
    pub function_name: String,
    pub args: Option<JsonValue>,
    pub type_args: Option<JsonValue>,
    pub result: JsonValue,
    pub success: bool,
    pub gas_used: Option<i64>,
    pub network: String,
}

/// Create a new simulation record
pub async fn create_simulation(pool: &DbPool, user_id: Option<Uuid>, input: CreateSimulation) -> Result<Simulation, sqlx::Error> {
    sqlx::query_as::<_, Simulation>(
        r#"
        INSERT INTO simulations (project_id, user_id, sender, module_address, module_name, function_name, args, type_args, result, success, gas_used, network)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
        "#,
    )
    .bind(input.project_id)
    .bind(user_id)
    .bind(&input.sender)
    .bind(&input.module_address)
    .bind(&input.module_name)
    .bind(&input.function_name)
    .bind(&input.args)
    .bind(&input.type_args)
    .bind(&input.result)
    .bind(input.success)
    .bind(input.gas_used)
    .bind(&input.network)
    .fetch_one(pool)
    .await
}

/// Get simulation by ID
pub async fn get_simulation_by_id(pool: &DbPool, id: Uuid) -> Result<Option<Simulation>, sqlx::Error> {
    sqlx::query_as::<_, Simulation>("SELECT * FROM simulations WHERE id = $1")
        .bind(id)
        .fetch_optional(pool)
        .await
}

/// List simulations with pagination
pub async fn list_simulations(
    pool: &DbPool,
    user_id: Option<Uuid>,
    project_id: Option<Uuid>,
    limit: i64,
    offset: i64,
) -> Result<Vec<Simulation>, sqlx::Error> {
    let mut query = String::from("SELECT * FROM simulations WHERE 1=1");

    if user_id.is_some() {
        query.push_str(" AND user_id = $1");
    }
    if project_id.is_some() {
        query.push_str(" AND project_id = $2");
    }

    query.push_str(" ORDER BY created_at DESC LIMIT $3 OFFSET $4");

    sqlx::query_as::<_, Simulation>(&query)
        .bind(user_id)
        .bind(project_id)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await
}

/// List simulations for a user
pub async fn list_user_simulations(
    pool: &DbPool,
    user_id: Uuid,
    limit: i64,
    offset: i64,
) -> Result<Vec<Simulation>, sqlx::Error> {
    sqlx::query_as::<_, Simulation>(
        r#"
        SELECT * FROM simulations
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

/// List simulations for a project
pub async fn list_project_simulations(
    pool: &DbPool,
    project_id: Uuid,
    limit: i64,
    offset: i64,
) -> Result<Vec<Simulation>, sqlx::Error> {
    sqlx::query_as::<_, Simulation>(
        r#"
        SELECT * FROM simulations
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

/// Count simulations for a user
pub async fn count_user_simulations(pool: &DbPool, user_id: Uuid) -> Result<i64, sqlx::Error> {
    let result: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM simulations WHERE user_id = $1")
        .bind(user_id)
        .fetch_one(pool)
        .await?;
    Ok(result.0)
}
