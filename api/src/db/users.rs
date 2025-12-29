//! User database operations

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

use super::DbPool;

/// User model
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub clerk_id: String,
    pub email: String,
    pub name: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Create user input
#[derive(Debug, Deserialize)]
pub struct CreateUser {
    pub clerk_id: String,
    pub email: String,
    pub name: Option<String>,
}

/// Update user input
#[derive(Debug, Deserialize)]
pub struct UpdateUser {
    pub email: Option<String>,
    pub name: Option<String>,
}

/// Create a new user
pub async fn create_user(pool: &DbPool, input: CreateUser) -> Result<User, sqlx::Error> {
    sqlx::query_as::<_, User>(
        r#"
        INSERT INTO users (clerk_id, email, name)
        VALUES ($1, $2, $3)
        RETURNING *
        "#,
    )
    .bind(&input.clerk_id)
    .bind(&input.email)
    .bind(&input.name)
    .fetch_one(pool)
    .await
}

/// Get user by ID
pub async fn get_user_by_id(pool: &DbPool, id: Uuid) -> Result<Option<User>, sqlx::Error> {
    sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(id)
        .fetch_optional(pool)
        .await
}

/// Get user by Clerk ID
pub async fn get_user_by_clerk_id(pool: &DbPool, clerk_id: &str) -> Result<Option<User>, sqlx::Error> {
    sqlx::query_as::<_, User>("SELECT * FROM users WHERE clerk_id = $1")
        .bind(clerk_id)
        .fetch_optional(pool)
        .await
}

/// Update user
pub async fn update_user(pool: &DbPool, id: Uuid, input: UpdateUser) -> Result<Option<User>, sqlx::Error> {
    sqlx::query_as::<_, User>(
        r#"
        UPDATE users
        SET email = COALESCE($2, email),
            name = COALESCE($3, name)
        WHERE id = $1
        RETURNING *
        "#,
    )
    .bind(id)
    .bind(&input.email)
    .bind(&input.name)
    .fetch_optional(pool)
    .await
}

/// Delete user
pub async fn delete_user(pool: &DbPool, id: Uuid) -> Result<bool, sqlx::Error> {
    let result = sqlx::query("DELETE FROM users WHERE id = $1")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(result.rows_affected() > 0)
}

/// Upsert user (for Clerk webhook sync)
pub async fn upsert_user(pool: &DbPool, input: CreateUser) -> Result<User, sqlx::Error> {
    sqlx::query_as::<_, User>(
        r#"
        INSERT INTO users (clerk_id, email, name)
        VALUES ($1, $2, $3)
        ON CONFLICT (clerk_id)
        DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name
        RETURNING *
        "#,
    )
    .bind(&input.clerk_id)
    .bind(&input.email)
    .bind(&input.name)
    .fetch_one(pool)
    .await
}
