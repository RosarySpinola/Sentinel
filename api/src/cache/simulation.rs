use redis::AsyncCommands;
use sha2::{Digest, Sha256};

use super::{keys, RedisPool};
use crate::simulation::SimulationRequest;

/// Generates a deterministic hash of a simulation request for caching
pub fn hash_simulation_request(request: &SimulationRequest) -> String {
    let mut hasher = Sha256::new();

    // Include all relevant fields in the hash
    hasher.update(request.network.as_bytes());
    hasher.update(request.sender.as_bytes());
    hasher.update(request.module_address.as_bytes());
    hasher.update(request.module_name.as_bytes());
    hasher.update(request.function_name.as_bytes());

    // Hash type arguments
    for type_arg in &request.type_args {
        hasher.update(type_arg.as_bytes());
    }

    // Hash arguments as JSON
    if let Ok(args_json) = serde_json::to_string(&request.args) {
        hasher.update(args_json.as_bytes());
    }

    let result = hasher.finalize();
    hex::encode(result)
}

/// Gets a cached simulation result
pub async fn get_cached_simulation(
    pool: &RedisPool,
    network: &str,
    payload_hash: &str,
) -> Option<String> {
    let key = keys::simulation_key(network, payload_hash);
    let mut conn = pool.lock().await;

    let result: Result<Option<String>, _> = (&mut *conn).get(&key).await;
    result.ok().flatten()
}

/// Caches a simulation result
pub async fn cache_simulation(
    pool: &RedisPool,
    network: &str,
    payload_hash: &str,
    result: &str,
    success: bool,
) -> Result<(), redis::RedisError> {
    let key = keys::simulation_key(network, payload_hash);
    let ttl = if success {
        keys::ttl::SIMULATION_SUCCESS
    } else {
        keys::ttl::SIMULATION_FAILED
    };

    let mut conn = pool.lock().await;
    (&mut *conn).set_ex(&key, result, ttl).await
}

/// Gets a cached module ABI
pub async fn get_cached_module(
    pool: &RedisPool,
    network: &str,
    address: &str,
) -> Option<String> {
    let key = keys::module_key(network, address);
    let mut conn = pool.lock().await;

    let result: Result<Option<String>, _> = (&mut *conn).get(&key).await;
    result.ok().flatten()
}

/// Caches a module ABI
pub async fn cache_module(
    pool: &RedisPool,
    network: &str,
    address: &str,
    abi: &str,
) -> Result<(), redis::RedisError> {
    let key = keys::module_key(network, address);
    let mut conn = pool.lock().await;

    (&mut *conn).set_ex(&key, abi, keys::ttl::MODULE_ABI).await
}

/// Gets cached account state
pub async fn get_cached_account(
    pool: &RedisPool,
    network: &str,
    address: &str,
) -> Option<String> {
    let key = keys::account_key(network, address);
    let mut conn = pool.lock().await;

    let result: Result<Option<String>, _> = (&mut *conn).get(&key).await;
    result.ok().flatten()
}

/// Caches account state
pub async fn cache_account(
    pool: &RedisPool,
    network: &str,
    address: &str,
    state: &str,
) -> Result<(), redis::RedisError> {
    let key = keys::account_key(network, address);
    let mut conn = pool.lock().await;

    (&mut *conn).set_ex(&key, state, keys::ttl::ACCOUNT_STATE).await
}

// Hex encoding utility
mod hex {
    const HEX_CHARS: &[u8; 16] = b"0123456789abcdef";

    pub fn encode(bytes: impl AsRef<[u8]>) -> String {
        let bytes = bytes.as_ref();
        let mut result = String::with_capacity(bytes.len() * 2);
        for &byte in bytes {
            result.push(HEX_CHARS[(byte >> 4) as usize] as char);
            result.push(HEX_CHARS[(byte & 0x0f) as usize] as char);
        }
        result
    }
}
