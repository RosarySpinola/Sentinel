use axum::{
    middleware,
    routing::{delete, get, post},
    Router,
};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

mod auth;
mod cache;
mod config;
mod db;
mod error;
mod gas;
mod prover;
mod routes;
mod simulation;
mod trace;

use cache::RedisPool;
use config::Config;
use db::DbPool;
use gas::GasAnalyzer;
use simulation::SimulationExecutor;
use trace::TraceExecutor;

#[derive(Clone)]
pub struct AppState {
    pub simulation: Arc<SimulationExecutor>,
    pub trace: Arc<TraceExecutor>,
    pub gas_analyzer: Arc<GasAnalyzer>,
    pub db: DbPool,
    pub redis: Option<RedisPool>,
}

#[tokio::main]
async fn main() {
    // Load environment variables first
    dotenvy::dotenv().ok();

    // Initialize Sentry (before any other initialization)
    let _sentry_guard = if let Ok(dsn) = std::env::var("SENTRY_DSN") {
        Some(sentry::init((
            dsn,
            sentry::ClientOptions {
                release: sentry::release_name!(),
                environment: Some(
                    std::env::var("RUST_ENV")
                        .unwrap_or_else(|_| "development".into())
                        .into(),
                ),
                traces_sample_rate: 0.1,
                ..Default::default()
            },
        )))
    } else {
        tracing::info!("Sentry DSN not configured, error monitoring disabled");
        None
    };

    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "sentinel_api=info,tower_http=debug".into()),
        )
        .init();

    // Load configuration
    let config = Config::from_env();
    tracing::info!("Starting Sentinel API on port {}", config.port);

    // Initialize database pool
    let db_pool = db::create_pool()
        .await
        .expect("Failed to create database pool");

    // Run migrations in development
    if std::env::var("RUN_MIGRATIONS").unwrap_or_default() == "true" {
        db::run_migrations(&db_pool)
            .await
            .expect("Failed to run database migrations");
    }

    // Initialize Redis pool (optional, graceful degradation if not available)
    let redis_pool = match cache::create_redis_pool().await {
        Ok(pool) => {
            tracing::info!("Redis connection established");
            Some(pool)
        }
        Err(e) => {
            tracing::warn!("Redis not available, caching disabled: {}", e);
            None
        }
    };

    // Create executors
    let app_state = AppState {
        simulation: Arc::new(SimulationExecutor::new(config.clone())),
        trace: Arc::new(TraceExecutor::new(config.clone())),
        gas_analyzer: Arc::new(GasAnalyzer::new(config.clone())),
        db: db_pool,
        redis: redis_pool,
    };

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Protected routes (require API key)
    let protected_routes = Router::new()
        .route("/simulate", post(routes::simulate_transaction))
        .route("/simulate/batch", post(routes::simulate_batch))
        .route("/trace", post(routes::get_trace))
        .route("/prove", post(routes::run_prover))
        .route("/analyze-gas", post(routes::analyze_gas))
        .layer(middleware::from_fn_with_state(
            app_state.db.clone(),
            auth::api_key_auth,
        ));

    // API key management routes (require session auth)
    let api_key_routes = Router::new()
        .route("/", post(routes::create_api_key))
        .route("/", get(routes::list_api_keys))
        .route("/:id", delete(routes::delete_api_key));

    // Build the main router
    let app = Router::new()
        .route("/health", get(routes::health_check))
        .route("/livez", get(routes::liveness))
        .route("/readyz", get(routes::readiness))
        .nest("/api/v1", protected_routes)
        .nest("/api/v1/api-keys", api_key_routes)
        .with_state(app_state)
        .layer(TraceLayer::new_for_http())
        .layer(cors);

    // Start the server
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", config.port))
        .await
        .expect("Failed to bind to port");

    tracing::info!("Sentinel API listening on http://0.0.0.0:{}", config.port);

    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}
