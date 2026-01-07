/// Simple counter module for demonstrating Sentinel features
/// - Transaction simulation: Increment/decrement operations
/// - Debugger: Step through counter updates
/// - Move Prover: Verify counter invariants
module sentinel_demo::counter {
    use std::signer;
    use std::error;

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_COUNTER_OVERFLOW: u64 = 3;
    const E_COUNTER_UNDERFLOW: u64 = 4;

    /// Maximum counter value to prevent overflow
    const MAX_COUNTER: u64 = 1000000;

    /// Counter resource stored at user's address
    struct Counter has key {
        value: u64,
    }

    /// Initialize a counter for the signer
    public entry fun initialize(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<Counter>(addr), error::already_exists(E_ALREADY_INITIALIZED));
        move_to(account, Counter { value: 0 });
    }

    /// Increment the counter by a given amount
    public entry fun increment(account: &signer, amount: u64) acquires Counter {
        let addr = signer::address_of(account);
        assert!(exists<Counter>(addr), error::not_found(E_NOT_INITIALIZED));

        let counter = borrow_global_mut<Counter>(addr);
        let new_value = counter.value + amount;
        assert!(new_value <= MAX_COUNTER, error::invalid_state(E_COUNTER_OVERFLOW));
        counter.value = new_value;
    }

    /// Decrement the counter by a given amount
    public entry fun decrement(account: &signer, amount: u64) acquires Counter {
        let addr = signer::address_of(account);
        assert!(exists<Counter>(addr), error::not_found(E_NOT_INITIALIZED));

        let counter = borrow_global_mut<Counter>(addr);
        assert!(counter.value >= amount, error::invalid_state(E_COUNTER_UNDERFLOW));
        counter.value = counter.value - amount;
    }

    /// Reset counter to zero
    public entry fun reset(account: &signer) acquires Counter {
        let addr = signer::address_of(account);
        assert!(exists<Counter>(addr), error::not_found(E_NOT_INITIALIZED));

        let counter = borrow_global_mut<Counter>(addr);
        counter.value = 0;
    }

    /// Get the current counter value
    #[view]
    public fun get_value(addr: address): u64 acquires Counter {
        assert!(exists<Counter>(addr), error::not_found(E_NOT_INITIALIZED));
        borrow_global<Counter>(addr).value
    }

    /// Check if counter is initialized
    #[view]
    public fun is_initialized(addr: address): bool {
        exists<Counter>(addr)
    }

    // ============================================
    // Move Prover Specifications
    // ============================================

    spec module {
        /// Counter value should never exceed MAX_COUNTER
        invariant forall addr: address where exists<Counter>(addr):
            global<Counter>(addr).value <= MAX_COUNTER;
    }

    spec initialize {
        /// Must not already have a counter
        aborts_if exists<Counter>(signer::address_of(account));
        /// After initialization, counter exists with value 0
        ensures exists<Counter>(signer::address_of(account));
        ensures global<Counter>(signer::address_of(account)).value == 0;
    }

    spec increment {
        let addr = signer::address_of(account);
        /// Must have an initialized counter
        aborts_if !exists<Counter>(addr);
        /// Must not overflow MAX_COUNTER
        aborts_if global<Counter>(addr).value + amount > MAX_COUNTER;
        /// Value increases by amount
        ensures global<Counter>(addr).value == old(global<Counter>(addr).value) + amount;
    }

    spec decrement {
        let addr = signer::address_of(account);
        /// Must have an initialized counter
        aborts_if !exists<Counter>(addr);
        /// Must not underflow
        aborts_if global<Counter>(addr).value < amount;
        /// Value decreases by amount
        ensures global<Counter>(addr).value == old(global<Counter>(addr).value) - amount;
    }

    spec reset {
        let addr = signer::address_of(account);
        /// Must have an initialized counter
        aborts_if !exists<Counter>(addr);
        /// After reset, value is 0
        ensures global<Counter>(addr).value == 0;
    }

    spec get_value {
        aborts_if !exists<Counter>(addr);
        ensures result == global<Counter>(addr).value;
    }
}
