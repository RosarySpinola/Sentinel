use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub port: u16,
    pub movement_rpc_mainnet: String,
    pub movement_rpc_testnet: String,
    pub cors_origin: String,
}

impl Config {
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();

        Self {
            port: env::var("PORT")
                .unwrap_or_else(|_| "4004".to_string())
                .parse()
                .expect("PORT must be a number"),
            movement_rpc_mainnet: env::var("MOVEMENT_RPC_MAINNET")
                .unwrap_or_else(|_| "https://mainnet.movementnetwork.xyz/v1".to_string()),
            movement_rpc_testnet: env::var("MOVEMENT_RPC_TESTNET")
                .unwrap_or_else(|_| "https://testnet.movementnetwork.xyz/v1".to_string()),
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
}
