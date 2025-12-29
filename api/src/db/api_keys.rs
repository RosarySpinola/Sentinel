//! API key database operations

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

use super::DbPool;

/// API key model
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ApiKey {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub key_hash: String,
    pub key_prefix: String,
    pub last_used_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub expires_at: Option<DateTime<Utc>>,
}

/// API key for list response (without hash)
#[derive(Debug, Clone, Serialize)]
pub struct ApiKeyInfo {
    pub id: Uuid,
    pub name: String,
    pub key_prefix: String,
    pub last_used_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub expires_at: Option<DateTime<Utc>>,
}

impl From<ApiKey> for ApiKeyInfo {
    fn from(key: ApiKey) -> Self {
        Self {
            id: key.id,
            name: key.name,
            key_prefix: key.key_prefix,
            last_used_at: key.last_used_at,
            created_at: key.created_at,
            expires_at: key.expires_at,
        }
    }
}

/// Create API key input
#[derive(Debug, Deserialize)]
pub struct CreateApiKey {
    pub name: String,
    pub key_hash: String,
    pub key_prefix: String,
    pub expires_at: Option<DateTime<Utc>>,
}

/// Create a new API key
pub async fn create_api_key(pool: &DbPool, user_id: Uuid, input: CreateApiKey) -> Result<ApiKey, sqlx::Error> {
    sqlx::query_as::<_, ApiKey>(
        r#"
        INSERT INTO api_keys (user_id, name, key_hash, key_prefix, expires_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        "#,
    )
    .bind(user_id)
    .bind(&input.name)
    .bind(&input.key_hash)
    .bind(&input.key_prefix)
    .bind(input.expires_at)
    .fetch_one(pool)
    .await
}

/// Get API key by ID
pub async fn get_api_key_by_id(pool: &DbPool, id: Uuid) -> Result<Option<ApiKey>, sqlx::Error> {
    sqlx::query_as::<_, ApiKey>("SELECT * FROM api_keys WHERE id = $1")
        .bind(id)
        .fetch_optional(pool)
        .await
}

/// Get API key by prefix (for lookup)
pub async fn get_api_key_by_prefix(pool: &DbPool, prefix: &str) -> Result<Option<ApiKey>, sqlx::Error> {
    sqlx::query_as::<_, ApiKey>("SELECT * FROM api_keys WHERE key_prefix = $1")
        .bind(prefix)
        .fetch_optional(pool)
        .await
}

/// List API keys for a user
pub async fn list_api_keys(pool: &DbPool, user_id: Uuid) -> Result<Vec<ApiKeyInfo>, sqlx::Error> {
    let keys = sqlx::query_as::<_, ApiKey>(
        "SELECT * FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC"
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;

    Ok(keys.into_iter().map(ApiKeyInfo::from).collect())
}

/// Update last used timestamp
pub async fn update_api_key_last_used(pool: &DbPool, id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE api_keys SET last_used_at = NOW() WHERE id = $1")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

/// Delete API key
pub async fn delete_api_key(pool: &DbPool, id: Uuid, user_id: Uuid) -> Result<bool, sqlx::Error> {
    let result = sqlx::query("DELETE FROM api_keys WHERE id = $1 AND user_id = $2")
        .bind(id)
        .bind(user_id)
        .execute(pool)
        .await?;
    Ok(result.rows_affected() > 0)
}

/// Count API keys for a user
pub async fn count_api_keys(pool: &DbPool, user_id: Uuid) -> Result<i64, sqlx::Error> {
    let result: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM api_keys WHERE user_id = $1")
        .bind(user_id)
        .fetch_one(pool)
        .await?;
    Ok(result.0)
}

/// Check if API key is expired
pub fn is_api_key_expired(key: &ApiKey) -> bool {
    if let Some(expires_at) = key.expires_at {
        expires_at < Utc::now()
    } else {
        false
    }
}
