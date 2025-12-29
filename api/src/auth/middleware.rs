use axum::{
    extract::{Request, State},
    http::{header, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use sqlx::PgPool;
use uuid::Uuid;

use super::verify_api_key;

/// User info extracted from API key authentication
#[derive(Clone, Debug)]
pub struct AuthenticatedUser {
    pub user_id: String,
    pub api_key_id: Uuid,
}

/// Middleware to authenticate requests using API key
pub async fn api_key_auth(
    State(pool): State<PgPool>,
    mut request: Request,
    next: Next,
) -> Response {
    // Extract API key from Authorization header or X-API-Key header
    let api_key = extract_api_key(&request);

    let api_key = match api_key {
        Some(key) => key,
        None => {
            return (
                StatusCode::UNAUTHORIZED,
                Json(json!({ "error": "Missing API key. Provide via Authorization: Bearer <key> or X-API-Key header" })),
            )
                .into_response();
        }
    };

    // Look up the key in the database
    match authenticate_key(&pool, &api_key).await {
        Ok(user) => {
            // Add user info to request extensions
            request.extensions_mut().insert(user);
            next.run(request).await
        }
        Err(AuthError::NotFound) => (
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": "Invalid API key" })),
        )
            .into_response(),
        Err(AuthError::Expired) => (
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": "API key has expired" })),
        )
            .into_response(),
        Err(AuthError::DatabaseError(e)) => {
            tracing::error!("Database error during auth: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": "Authentication failed" })),
            )
                .into_response()
        }
    }
}

fn extract_api_key(request: &Request) -> Option<String> {
    // Try Authorization: Bearer <key>
    if let Some(auth_header) = request.headers().get(header::AUTHORIZATION) {
        if let Ok(auth_str) = auth_header.to_str() {
            if let Some(key) = auth_str.strip_prefix("Bearer ") {
                return Some(key.trim().to_string());
            }
        }
    }

    // Try X-API-Key header
    if let Some(key_header) = request.headers().get("X-API-Key") {
        if let Ok(key) = key_header.to_str() {
            return Some(key.trim().to_string());
        }
    }

    None
}

async fn authenticate_key(pool: &PgPool, raw_key: &str) -> Result<AuthenticatedUser, AuthError> {
    // Fetch all non-expired keys for verification
    // Note: In production, you'd want to add an index on key_prefix and filter first
    let keys: Vec<ApiKeyRow> = sqlx::query_as::<_, ApiKeyRow>(
        r#"
        SELECT id, user_id, key_hash, expires_at
        FROM api_keys
        WHERE expires_at IS NULL OR expires_at > NOW()
        "#
    )
    .fetch_all(pool)
    .await
    .map_err(|e| AuthError::DatabaseError(e.to_string()))?;

    // Find matching key using constant-time comparison
    for key in keys {
        if verify_api_key(raw_key, &key.key_hash) {
            // Update last_used_at
            sqlx::query(
                r#"UPDATE api_keys SET last_used_at = NOW() WHERE id = $1"#
            )
            .bind(key.id)
            .execute(pool)
            .await
            .ok(); // Ignore errors for usage tracking

            return Ok(AuthenticatedUser {
                user_id: key.user_id,
                api_key_id: key.id,
            });
        }
    }

    Err(AuthError::NotFound)
}

#[derive(Debug, sqlx::FromRow)]
struct ApiKeyRow {
    id: Uuid,
    user_id: String,
    key_hash: String,
    #[allow(dead_code)]
    expires_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, thiserror::Error)]
pub enum AuthError {
    #[error("API key not found")]
    NotFound,
    #[error("API key has expired")]
    Expired,
    #[error("Database error: {0}")]
    DatabaseError(String),
}
