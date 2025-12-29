//! Database connection pool management

use sqlx::postgres::{PgPool, PgPoolOptions};
use std::time::Duration;

/// Database pool type alias
pub type DbPool = PgPool;

/// Create a new database connection pool
pub async fn create_pool() -> Result<DbPool, sqlx::Error> {
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");

    let pool = PgPoolOptions::new()
        .min_connections(2)
        .max_connections(10)
        .acquire_timeout(Duration::from_secs(30))
        .idle_timeout(Duration::from_secs(600))
        .connect(&database_url)
        .await?;

    tracing::info!("Database connection pool created");
    Ok(pool)
}

/// Check database health
pub async fn health_check(pool: &DbPool) -> Result<(), sqlx::Error> {
    sqlx::query("SELECT 1")
        .execute(pool)
        .await?;
    Ok(())
}

/// Run database migrations
pub async fn run_migrations(pool: &DbPool) -> Result<(), sqlx::Error> {
    sqlx::migrate!("./migrations")
        .run(pool)
        .await?;
    tracing::info!("Database migrations completed");
    Ok(())
}
