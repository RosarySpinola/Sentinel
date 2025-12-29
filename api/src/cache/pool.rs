use redis::aio::MultiplexedConnection;
use redis::Client;
use std::sync::Arc;
use tokio::sync::{Mutex, OnceCell};

/// Redis connection type with interior mutability
pub type RedisPool = Arc<Mutex<MultiplexedConnection>>;

static REDIS_POOL: OnceCell<RedisPool> = OnceCell::const_new();

/// Creates a Redis connection from environment
pub async fn create_redis_pool() -> Result<RedisPool, redis::RedisError> {
    let redis_url = std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://localhost:6379".into());

    let client = Client::open(redis_url)?;
    let conn = client.get_multiplexed_async_connection().await?;

    Ok(Arc::new(Mutex::new(conn)))
}

/// Gets or creates the global Redis pool
pub async fn get_redis_pool() -> Result<RedisPool, redis::RedisError> {
    match REDIS_POOL.get() {
        Some(pool) => Ok(pool.clone()),
        None => {
            let pool = create_redis_pool().await?;
            let _ = REDIS_POOL.set(pool.clone());
            Ok(pool)
        }
    }
}

/// Health check for Redis connection
pub async fn redis_health_check(pool: &RedisPool) -> bool {
    let mut conn = pool.lock().await;
    let result: Result<String, _> = redis::cmd("PING")
        .query_async(&mut *conn)
        .await;
    result.is_ok()
}
