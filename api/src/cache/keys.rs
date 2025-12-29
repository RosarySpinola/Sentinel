//! Cache key generation utilities
//!
//! Key patterns:
//! - sim:{network}:{hash}    - Simulation result (24h TTL)
//! - mod:{network}:{address} - Module ABI (1h TTL)
//! - acc:{network}:{address} - Account resources (5min TTL)
//! - rate:{user_id}          - Rate limit counter (1min TTL)

/// TTL values in seconds
pub mod ttl {
    pub const SIMULATION_SUCCESS: u64 = 86400; // 24 hours
    pub const SIMULATION_FAILED: u64 = 300; // 5 minutes
    pub const MODULE_ABI: u64 = 3600; // 1 hour
    pub const ACCOUNT_STATE: u64 = 300; // 5 minutes
    pub const RATE_LIMIT: u64 = 60; // 1 minute
}

/// Generates a cache key for simulation results
pub fn simulation_key(network: &str, payload_hash: &str) -> String {
    format!("sim:{}:{}", network, payload_hash)
}

/// Generates a cache key for module ABIs
pub fn module_key(network: &str, address: &str) -> String {
    format!("mod:{}:{}", network, address)
}

/// Generates a cache key for account state
pub fn account_key(network: &str, address: &str) -> String {
    format!("acc:{}:{}", network, address)
}

/// Generates a cache key for rate limiting
pub fn rate_limit_key(user_id: &str) -> String {
    format!("rate:{}", user_id)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_simulation_key() {
        let key = simulation_key("testnet", "abc123");
        assert_eq!(key, "sim:testnet:abc123");
    }

    #[test]
    fn test_module_key() {
        let key = module_key("mainnet", "0x1::coin");
        assert_eq!(key, "mod:mainnet:0x1::coin");
    }

    #[test]
    fn test_rate_limit_key() {
        let key = rate_limit_key("user_abc123");
        assert_eq!(key, "rate:user_abc123");
    }
}
