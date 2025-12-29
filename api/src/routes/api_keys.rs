use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::auth::generate_api_key;
use crate::AppState;

#[derive(Debug, Deserialize)]
pub struct CreateApiKeyRequest {
    pub name: String,
    #[serde(default)]
    pub expires_in_days: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct CreateApiKeyResponse {
    pub id: String,
    pub name: String,
    pub key: String, // Raw key - shown only once
    pub key_prefix: String,
    pub expires_at: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize)]
pub struct ApiKeyInfo {
    pub id: String,
    pub name: String,
    pub key_prefix: String,
    pub last_used_at: Option<String>,
    pub expires_at: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize)]
pub struct ListApiKeysResponse {
    pub api_keys: Vec<ApiKeyInfo>,
}

/// POST /api/v1/api-keys - Create a new API key
/// Requires Clerk session authentication (user_id from header)
pub async fn create_api_key(
    State(state): State<AppState>,
    Json(request): Json<CreateApiKeyRequest>,
) -> impl IntoResponse {
    let pool = &state.db;
    // In production, get user_id from Clerk JWT middleware
    // For now, using a placeholder user_id header
    let user_id = "user_placeholder"; // TODO: Extract from Clerk JWT

    // Validate name
    if request.name.trim().is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({ "error": "Name is required" })),
        )
            .into_response();
    }

    // Check rate limit (max 10 keys per user)
    let key_count: i64 = sqlx::query_scalar::<_, i64>(
        r#"SELECT COUNT(*) FROM api_keys WHERE user_id = $1"#
    )
    .bind(user_id)
    .fetch_one(pool)
    .await
    .unwrap_or(0);

    if key_count >= 10 {
        return (
            StatusCode::TOO_MANY_REQUESTS,
            Json(serde_json::json!({ "error": "Maximum of 10 API keys allowed per user" })),
        )
            .into_response();
    }

    // Generate the API key
    let (raw_key, key_hash, key_prefix) = match generate_api_key() {
        Ok(k) => k,
        Err(e) => {
            tracing::error!("Failed to generate API key: {}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Failed to generate API key" })),
            )
                .into_response();
        }
    };

    // Calculate expiration
    let expires_at = request.expires_in_days.map(|days| Utc::now() + Duration::days(days));

    // Store in database
    let id = Uuid::new_v4();
    let now = Utc::now();

    let result = sqlx::query(
        r#"
        INSERT INTO api_keys (id, user_id, name, key_hash, key_prefix, expires_at, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        "#
    )
    .bind(id)
    .bind(user_id)
    .bind(request.name.trim())
    .bind(&key_hash)
    .bind(&key_prefix)
    .bind(expires_at)
    .bind(now)
    .execute(pool)
    .await;

    match result {
        Ok(_) => {
            let response = CreateApiKeyResponse {
                id: id.to_string(),
                name: request.name.trim().to_string(),
                key: raw_key, // Show only once
                key_prefix,
                expires_at: expires_at.map(|d| d.to_rfc3339()),
                created_at: now.to_rfc3339(),
            };
            (StatusCode::CREATED, Json(serde_json::json!(response))).into_response()
        }
        Err(e) => {
            tracing::error!("Failed to store API key: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Failed to create API key" })),
            )
                .into_response()
        }
    }
}

/// GET /api/v1/api-keys - List user's API keys
pub async fn list_api_keys(State(state): State<AppState>) -> impl IntoResponse {
    let pool = &state.db;
    let user_id = "user_placeholder"; // TODO: Extract from Clerk JWT

    let keys = sqlx::query_as::<_, ApiKeyRow>(
        r#"
        SELECT id, name, key_prefix, last_used_at, expires_at, created_at
        FROM api_keys
        WHERE user_id = $1
        ORDER BY created_at DESC
        "#
    )
    .bind(user_id)
    .fetch_all(pool)
    .await;

    match keys {
        Ok(rows) => {
            let api_keys: Vec<ApiKeyInfo> = rows
                .into_iter()
                .map(|row| ApiKeyInfo {
                    id: row.id.to_string(),
                    name: row.name,
                    key_prefix: row.key_prefix,
                    last_used_at: row.last_used_at.map(|d| d.to_rfc3339()),
                    expires_at: row.expires_at.map(|d| d.to_rfc3339()),
                    created_at: row.created_at.to_rfc3339(),
                })
                .collect();

            Json(ListApiKeysResponse { api_keys }).into_response()
        }
        Err(e) => {
            tracing::error!("Failed to fetch API keys: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Failed to fetch API keys" })),
            )
                .into_response()
        }
    }
}

#[derive(sqlx::FromRow)]
struct ApiKeyRow {
    id: Uuid,
    name: String,
    key_prefix: String,
    last_used_at: Option<chrono::DateTime<chrono::Utc>>,
    expires_at: Option<chrono::DateTime<chrono::Utc>>,
    created_at: chrono::DateTime<chrono::Utc>,
}

/// DELETE /api/v1/api-keys/:id - Revoke an API key
pub async fn delete_api_key(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    let pool = &state.db;
    let user_id = "user_placeholder"; // TODO: Extract from Clerk JWT

    let result = sqlx::query(
        r#"DELETE FROM api_keys WHERE id = $1 AND user_id = $2"#
    )
    .bind(id)
    .bind(user_id)
    .execute(pool)
    .await;

    match result {
        Ok(res) => {
            if res.rows_affected() == 0 {
                (
                    StatusCode::NOT_FOUND,
                    Json(serde_json::json!({ "error": "API key not found" })),
                )
                    .into_response()
            } else {
                Json(serde_json::json!({ "success": true })).into_response()
            }
        }
        Err(e) => {
            tracing::error!("Failed to delete API key: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Failed to delete API key" })),
            )
                .into_response()
        }
    }
}
