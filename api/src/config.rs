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

        // Set up Move Prover dependencies (Boogie and Z3) if not already configured
        Self::setup_prover_env();

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

    /// Set up Move Prover environment variables (Boogie and Z3)
    fn setup_prover_env() {
        // Set DOTNET_ROOT for Boogie to find .NET runtime
        if env::var("DOTNET_ROOT").is_err() {
            let dotnet_paths = [
                "/opt/homebrew/opt/dotnet@8/libexec",
                "/usr/local/share/dotnet",
                "/opt/homebrew/opt/dotnet/libexec",
            ];

            for path in &dotnet_paths {
                if std::path::Path::new(path).exists() {
                    env::set_var("DOTNET_ROOT", path);
                    tracing::info!("DOTNET_ROOT set to: {}", path);
                    break;
                }
            }
        }

        // Set BOOGIE_EXE if not already set
        if env::var("BOOGIE_EXE").is_err() {
            // Try common locations for Boogie
            let home = env::var("HOME").unwrap_or_default();
            let boogie_paths = [
                format!("{}/.dotnet/tools/boogie", home),
                "/usr/local/bin/boogie".to_string(),
                "/opt/homebrew/bin/boogie".to_string(),
            ];

            for path in &boogie_paths {
                if std::path::Path::new(path).exists() {
                    env::set_var("BOOGIE_EXE", path);
                    tracing::info!("BOOGIE_EXE set to: {}", path);
                    break;
                }
            }
        }

        // Set Z3_EXE if not already set
        // Move Prover requires Z3 <= 4.11.2, so prioritize that version
        if env::var("Z3_EXE").is_err() {
            let home = env::var("HOME").unwrap_or_default();
            let z3_paths = [
                format!("{}/.local/opt/z3-4.11.2/bin/z3", home),
                "/opt/homebrew/bin/z3".to_string(),
                "/usr/local/bin/z3".to_string(),
                "/usr/bin/z3".to_string(),
            ];

            for path in &z3_paths {
                if std::path::Path::new(path).exists() {
                    env::set_var("Z3_EXE", path);
                    tracing::info!("Z3_EXE set to: {}", path);
                    break;
                }
            }
        }
    }
}
