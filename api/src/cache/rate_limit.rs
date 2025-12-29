use redis::AsyncCommands;

use super::{keys, RedisPool};

/// Result of a rate limit check
#[derive(Debug, Clone)]
pub struct RateLimitResult {
    /// Whether the request is allowed
    pub allowed: bool,
    /// Remaining requests in the current window
    pub remaining: u32,
    /// Total limit for the window
    pub limit: u32,
    /// Unix timestamp when the window resets
    pub reset_at: u64,
}

/// Checks rate limit for a user
///
/// Uses Redis INCR with EXPIRE for atomic counter
pub async fn check_rate_limit(
    pool: &RedisPool,
    user_id: &str,
    limit: u32,
    window_secs: u64,
) -> Result<RateLimitResult, redis::RedisError> {
    let key = keys::rate_limit_key(user_id);
    let mut conn = pool.lock().await;
    let conn_ref = &mut *conn;

    // Increment counter
    let count: u32 = conn_ref.incr(&key, 1).await?;

    // Set expiry on first request
    if count == 1 {
        let _: () = conn_ref.expire(&key, window_secs as i64).await?;
    }

    // Get TTL for reset time
    let ttl: i64 = conn_ref.ttl(&key).await.unwrap_or(window_secs as i64);
    let reset_at = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs()
        + ttl as u64;

    let allowed = count <= limit;
    let remaining = if count > limit { 0 } else { limit - count };

    Ok(RateLimitResult {
        allowed,
        remaining,
        limit,
        reset_at,
    })
}

/// Gets the current rate limit count for a user without incrementing
pub async fn get_rate_limit_count(pool: &RedisPool, user_id: &str) -> Result<u32, redis::RedisError> {
    let key = keys::rate_limit_key(user_id);
    let mut conn = pool.lock().await;

    let count: Option<u32> = (&mut *conn).get(&key).await?;
    Ok(count.unwrap_or(0))
}

/// Resets rate limit for a user (admin use only)
pub async fn reset_rate_limit(pool: &RedisPool, user_id: &str) -> Result<(), redis::RedisError> {
    let key = keys::rate_limit_key(user_id);
    let mut conn = pool.lock().await;

    (&mut *conn).del(&key).await
}

/// Default rate limits by tier
pub mod limits {
    pub const FREE_TIER: u32 = 100; // 100 requests per minute
    pub const PRO_TIER: u32 = 1000; // 1000 requests per minute
    pub const WINDOW_SECS: u64 = 60; // 1 minute window
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rate_limit_result() {
        let result = RateLimitResult {
            allowed: true,
            remaining: 99,
            limit: 100,
            reset_at: 1234567890,
        };
        assert!(result.allowed);
        assert_eq!(result.remaining, 99);
    }
}
