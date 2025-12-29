use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use rand::RngCore;

const KEY_PREFIX: &str = "stl_live_";
const RANDOM_BYTES: usize = 18; // Results in 24 base64 chars

/// Generates a new API key and returns (raw_key, key_hash, key_prefix)
pub fn generate_api_key() -> Result<(String, String, String), ApiKeyError> {
    // Generate random bytes
    let mut random_bytes = [0u8; RANDOM_BYTES];
    OsRng.fill_bytes(&mut random_bytes);

    // Encode to base64url (24 chars)
    let random_part = URL_SAFE_NO_PAD.encode(random_bytes);

    // Create full key: stl_live_xxxxxxxxxxxxxxxxxxxx
    let raw_key = format!("{}{}", KEY_PREFIX, random_part);

    // Create prefix for display (first 12 chars)
    let key_prefix = format!("{}{}...", KEY_PREFIX, &random_part[..4]);

    // Hash the key for storage
    let key_hash = hash_api_key(&raw_key)?;

    Ok((raw_key, key_hash, key_prefix))
}

/// Hashes an API key for secure storage
pub fn hash_api_key(raw_key: &str) -> Result<String, ApiKeyError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    let hash = argon2
        .hash_password(raw_key.as_bytes(), &salt)
        .map_err(|e| ApiKeyError::HashError(e.to_string()))?;

    Ok(hash.to_string())
}

/// Verifies an API key against its stored hash using constant-time comparison
pub fn verify_api_key(raw_key: &str, hash: &str) -> bool {
    let parsed_hash = match PasswordHash::new(hash) {
        Ok(h) => h,
        Err(_) => return false,
    };

    Argon2::default()
        .verify_password(raw_key.as_bytes(), &parsed_hash)
        .is_ok()
}

/// Extracts the prefix from a raw API key for display
pub fn get_key_prefix(raw_key: &str) -> String {
    if raw_key.len() > 16 {
        format!("{}...", &raw_key[..16])
    } else {
        raw_key.to_string()
    }
}

#[derive(Debug, thiserror::Error)]
pub enum ApiKeyError {
    #[error("Failed to hash API key: {0}")]
    HashError(String),
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_api_key() {
        let (raw_key, hash, prefix) = generate_api_key().unwrap();

        // Check key format
        assert!(raw_key.starts_with("stl_live_"));
        assert_eq!(raw_key.len(), 33); // 9 prefix + 24 random

        // Check prefix format
        assert!(prefix.starts_with("stl_live_"));
        assert!(prefix.ends_with("..."));

        // Check hash is valid
        assert!(hash.starts_with("$argon2"));

        // Verify key against hash
        assert!(verify_api_key(&raw_key, &hash));
    }

    #[test]
    fn test_verify_api_key_invalid() {
        let (raw_key, hash, _) = generate_api_key().unwrap();

        // Wrong key should fail
        assert!(!verify_api_key("stl_live_wrongkey123456789012", &hash));

        // Correct key should pass
        assert!(verify_api_key(&raw_key, &hash));
    }

    #[test]
    fn test_hash_uniqueness() {
        let key = "stl_live_test123456789012345678";
        let hash1 = hash_api_key(key).unwrap();
        let hash2 = hash_api_key(key).unwrap();

        // Same key should produce different hashes (due to unique salts)
        assert_ne!(hash1, hash2);

        // But both should verify correctly
        assert!(verify_api_key(key, &hash1));
        assert!(verify_api_key(key, &hash2));
    }
}
