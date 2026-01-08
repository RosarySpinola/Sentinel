use std::env;

/// Shinami Node Service base URLs for Movement
const SHINAMI_MOVEMENT_MAINNET: &str = "https://api.shinami.com/aptos/node/v1/movement_mainnet";
const SHINAMI_MOVEMENT_TESTNET: &str = "https://api.shinami.com/aptos/node/v1/movement_testnet";

/// Public Movement RPC fallbacks
const PUBLIC_MOVEMENT_MAINNET: &str = "https://mainnet.movementnetwork.xyz/v1";
const PUBLIC_MOVEMENT_TESTNET: &str = "https://testnet.movementnetwork.xyz/v1";

#[derive(Clone, Debug)]
pub struct Config {
    pub port: u16,
    pub movement_rpc_mainnet: String,
    pub movement_rpc_testnet: String,
    pub shinami_api_key: Option<String>,
    pub cors_origin: String,
}

impl Config {
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();

        // Check for Shinami API key
        let shinami_api_key = env::var("SHINAMI_KEY").ok();

        // Use Shinami URLs if API key is present, otherwise fall back to public RPC
        let (mainnet_url, testnet_url) = if shinami_api_key.is_some() {
            (
                env::var("MOVEMENT_RPC_MAINNET")
                    .unwrap_or_else(|_| SHINAMI_MOVEMENT_MAINNET.to_string()),
                env::var("MOVEMENT_RPC_TESTNET")
                    .unwrap_or_else(|_| SHINAMI_MOVEMENT_TESTNET.to_string()),
            )
        } else {
            (
                env::var("MOVEMENT_RPC_MAINNET")
                    .unwrap_or_else(|_| PUBLIC_MOVEMENT_MAINNET.to_string()),
                env::var("MOVEMENT_RPC_TESTNET")
                    .unwrap_or_else(|_| PUBLIC_MOVEMENT_TESTNET.to_string()),
            )
        };

        if shinami_api_key.is_some() {
            tracing::info!("Shinami API key configured - using Shinami Node Service");
        } else {
            tracing::warn!("No SHINAMI_KEY found - using public Movement RPC (rate limited)");
        }

        Self {
            port: env::var("PORT")
                .unwrap_or_else(|_| "4004".to_string())
                .parse()
                .expect("PORT must be a number"),
            movement_rpc_mainnet: mainnet_url,
            movement_rpc_testnet: testnet_url,
            shinami_api_key,
            cors_origin: env::var("CORS_ORIGIN")
                .unwrap_or_else(|_| "http://localhost:3000".to_string()),
        }
    }

    pub fn get_rpc_url(&self, network: &str) -> &str {
        match network {
            "mainnet" => &self.movement_rpc_mainnet,
            _ => &self.movement_rpc_testnet,
        }
    }

    /// Returns the Shinami API key if configured
    pub fn get_shinami_api_key(&self) -> Option<&str> {
        self.shinami_api_key.as_deref()
    }
}
