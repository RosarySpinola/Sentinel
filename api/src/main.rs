use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

mod config;
mod error;
mod gas;
mod prover;
mod routes;
mod simulation;
mod trace;

use config::Config;
use gas::GasAnalyzer;
use simulation::SimulationExecutor;
use trace::TraceExecutor;

#[derive(Clone)]
pub struct AppState {
    pub simulation: Arc<SimulationExecutor>,
    pub trace: Arc<TraceExecutor>,
    pub gas_analyzer: Arc<GasAnalyzer>,
}

#[tokio::main]
async fn main() {
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

    // Create executors
    let app_state = AppState {
        simulation: Arc::new(SimulationExecutor::new(config.clone())),
        trace: Arc::new(TraceExecutor::new(config.clone())),
        gas_analyzer: Arc::new(GasAnalyzer::new(config.clone())),
    };

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build the router
    let app = Router::new()
        .route("/health", get(routes::health_check))
        .route("/api/v1/simulate", post(routes::simulate_transaction))
        .route("/api/v1/simulate/batch", post(routes::simulate_batch))
        .route("/api/v1/trace", post(routes::get_trace))
        .route("/api/v1/prove", post(routes::run_prover))
        .route("/api/v1/analyze-gas", post(routes::analyze_gas))
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
