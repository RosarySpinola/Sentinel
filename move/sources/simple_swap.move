/// Simple token swap module for demonstrating Sentinel DeFi debugging
/// - Transaction simulation: Preview swap outcomes before execution
/// - Debugger: Step through AMM calculations
/// - Gas profiler: Analyze swap operation costs
/// - Move Prover: Verify swap invariants (k = x * y)
module sentinel_demo::simple_swap {
    use std::signer;
    use std::error;

    /// Error codes
    const E_POOL_NOT_INITIALIZED: u64 = 1;
    const E_POOL_ALREADY_EXISTS: u64 = 2;
    const E_INSUFFICIENT_LIQUIDITY: u64 = 3;
    const E_INSUFFICIENT_INPUT: u64 = 4;
    const E_SLIPPAGE_EXCEEDED: u64 = 5;
    const E_ZERO_AMOUNT: u64 = 6;

    /// Swap fee in basis points (0.3%)
    const FEE_BPS: u64 = 30;
    const BPS_DENOMINATOR: u64 = 10000;

    /// Liquidity pool with two token reserves
    struct Pool has key {
        reserve_a: u64,
        reserve_b: u64,
        total_lp_tokens: u64,
    }

    /// LP token balance for liquidity providers
    struct LPBalance has key {
        amount: u64,
    }

    /// Initialize a new liquidity pool
    public entry fun create_pool(
        admin: &signer,
        initial_a: u64,
        initial_b: u64
    ) {
        let addr = signer::address_of(admin);
        assert!(!exists<Pool>(addr), error::already_exists(E_POOL_ALREADY_EXISTS));
        assert!(initial_a > 0 && initial_b > 0, error::invalid_argument(E_ZERO_AMOUNT));

        // Initial LP tokens = sqrt(a * b) approximated
        let initial_lp = sqrt_approx(initial_a * initial_b);

        move_to(admin, Pool {
            reserve_a: initial_a,
            reserve_b: initial_b,
            total_lp_tokens: initial_lp,
        });

        move_to(admin, LPBalance { amount: initial_lp });
    }

    /// Swap token A for token B
    /// Returns the amount of token B received
    public entry fun swap_a_for_b(
        _user: &signer,
        pool_addr: address,
        amount_in: u64,
        min_amount_out: u64
    ) acquires Pool {
        assert!(exists<Pool>(pool_addr), error::not_found(E_POOL_NOT_INITIALIZED));
        assert!(amount_in > 0, error::invalid_argument(E_ZERO_AMOUNT));

        let pool = borrow_global_mut<Pool>(pool_addr);

        // Calculate output using constant product formula: (x + dx) * (y - dy) = x * y
        let amount_out = calculate_output(
            amount_in,
            pool.reserve_a,
            pool.reserve_b
        );

        assert!(amount_out >= min_amount_out, error::invalid_state(E_SLIPPAGE_EXCEEDED));
        assert!(amount_out < pool.reserve_b, error::invalid_state(E_INSUFFICIENT_LIQUIDITY));

        // Update reserves
        pool.reserve_a = pool.reserve_a + amount_in;
        pool.reserve_b = pool.reserve_b - amount_out;
    }

    /// Swap token B for token A
    public entry fun swap_b_for_a(
        _user: &signer,
        pool_addr: address,
        amount_in: u64,
        min_amount_out: u64
    ) acquires Pool {
        assert!(exists<Pool>(pool_addr), error::not_found(E_POOL_NOT_INITIALIZED));
        assert!(amount_in > 0, error::invalid_argument(E_ZERO_AMOUNT));

        let pool = borrow_global_mut<Pool>(pool_addr);

        let amount_out = calculate_output(
            amount_in,
            pool.reserve_b,
            pool.reserve_a
        );

        assert!(amount_out >= min_amount_out, error::invalid_state(E_SLIPPAGE_EXCEEDED));
        assert!(amount_out < pool.reserve_a, error::invalid_state(E_INSUFFICIENT_LIQUIDITY));

        pool.reserve_b = pool.reserve_b + amount_in;
        pool.reserve_a = pool.reserve_a - amount_out;
    }

    /// Add liquidity to the pool
    public entry fun add_liquidity(
        provider: &signer,
        pool_addr: address,
        amount_a: u64,
        amount_b: u64
    ) acquires Pool, LPBalance {
        assert!(exists<Pool>(pool_addr), error::not_found(E_POOL_NOT_INITIALIZED));

        let pool = borrow_global_mut<Pool>(pool_addr);

        // Calculate LP tokens to mint (proportional to contribution)
        let lp_tokens = if (pool.total_lp_tokens == 0) {
            sqrt_approx(amount_a * amount_b)
        } else {
            // Use the smaller ratio to ensure fair LP distribution
            let ratio_a = (amount_a * pool.total_lp_tokens) / pool.reserve_a;
            let ratio_b = (amount_b * pool.total_lp_tokens) / pool.reserve_b;
            if (ratio_a < ratio_b) { ratio_a } else { ratio_b }
        };

        pool.reserve_a = pool.reserve_a + amount_a;
        pool.reserve_b = pool.reserve_b + amount_b;
        pool.total_lp_tokens = pool.total_lp_tokens + lp_tokens;

        // Update or create LP balance
        let provider_addr = signer::address_of(provider);
        if (exists<LPBalance>(provider_addr)) {
            let balance = borrow_global_mut<LPBalance>(provider_addr);
            balance.amount = balance.amount + lp_tokens;
        } else {
            move_to(provider, LPBalance { amount: lp_tokens });
        };
    }

    /// Calculate swap output using constant product formula with fee
    fun calculate_output(
        amount_in: u64,
        reserve_in: u64,
        reserve_out: u64
    ): u64 {
        // Apply fee: amount_in_with_fee = amount_in * (10000 - 30) / 10000
        let amount_in_with_fee = amount_in * (BPS_DENOMINATOR - FEE_BPS);
        let numerator = amount_in_with_fee * reserve_out;
        let denominator = (reserve_in * BPS_DENOMINATOR) + amount_in_with_fee;
        numerator / denominator
    }

    /// Approximate square root using Newton's method (for LP token calculation)
    fun sqrt_approx(x: u64): u64 {
        if (x == 0) return 0;

        let z = x;
        let y = (x + 1) / 2;

        while (y < z) {
            z = y;
            y = (x / y + y) / 2;
        };

        z
    }

    // ============================================
    // View Functions
    // ============================================

    #[view]
    public fun get_reserves(pool_addr: address): (u64, u64) acquires Pool {
        assert!(exists<Pool>(pool_addr), error::not_found(E_POOL_NOT_INITIALIZED));
        let pool = borrow_global<Pool>(pool_addr);
        (pool.reserve_a, pool.reserve_b)
    }

    #[view]
    public fun get_quote_a_to_b(pool_addr: address, amount_in: u64): u64 acquires Pool {
        assert!(exists<Pool>(pool_addr), error::not_found(E_POOL_NOT_INITIALIZED));
        let pool = borrow_global<Pool>(pool_addr);
        calculate_output(amount_in, pool.reserve_a, pool.reserve_b)
    }

    #[view]
    public fun get_quote_b_to_a(pool_addr: address, amount_in: u64): u64 acquires Pool {
        assert!(exists<Pool>(pool_addr), error::not_found(E_POOL_NOT_INITIALIZED));
        let pool = borrow_global<Pool>(pool_addr);
        calculate_output(amount_in, pool.reserve_b, pool.reserve_a)
    }

    #[view]
    public fun get_lp_balance(addr: address): u64 acquires LPBalance {
        if (exists<LPBalance>(addr)) {
            borrow_global<LPBalance>(addr).amount
        } else {
            0
        }
    }

    // ============================================
    // Move Prover Specifications
    // ============================================

    spec module {
        /// Reserves should always be positive after pool creation
        invariant forall addr: address where exists<Pool>(addr):
            global<Pool>(addr).reserve_a > 0 && global<Pool>(addr).reserve_b > 0;
    }

    spec create_pool {
        aborts_if exists<Pool>(signer::address_of(admin));
        aborts_if initial_a == 0 || initial_b == 0;
        ensures exists<Pool>(signer::address_of(admin));
        ensures global<Pool>(signer::address_of(admin)).reserve_a == initial_a;
        ensures global<Pool>(signer::address_of(admin)).reserve_b == initial_b;
    }

    spec swap_a_for_b {
        aborts_if !exists<Pool>(pool_addr);
        aborts_if amount_in == 0;
        /// After swap: reserve_a increases, reserve_b decreases
        ensures global<Pool>(pool_addr).reserve_a > old(global<Pool>(pool_addr).reserve_a);
        ensures global<Pool>(pool_addr).reserve_b < old(global<Pool>(pool_addr).reserve_b);
    }

    spec swap_b_for_a {
        aborts_if !exists<Pool>(pool_addr);
        aborts_if amount_in == 0;
        ensures global<Pool>(pool_addr).reserve_b > old(global<Pool>(pool_addr).reserve_b);
        ensures global<Pool>(pool_addr).reserve_a < old(global<Pool>(pool_addr).reserve_a);
    }

    spec calculate_output {
        /// Output should be less than reserve_out (can't drain the pool)
        ensures result < reserve_out;
        /// Output should be positive for positive input
        ensures amount_in > 0 ==> result > 0;
    }

    spec sqrt_approx {
        ensures result * result <= x;
        ensures (result + 1) * (result + 1) > x;
    }
}
