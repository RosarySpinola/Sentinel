#[test_only]
module sentinel_demo::swap_tests {
    use std::signer;
    use sentinel_demo::simple_swap;

    #[test(admin = @0x123)]
    fun test_create_pool(admin: &signer) {
        simple_swap::create_pool(admin, 1000000, 1000000);
        let addr = signer::address_of(admin);
        let (reserve_a, reserve_b) = simple_swap::get_reserves(addr);
        assert!(reserve_a == 1000000, 0);
        assert!(reserve_b == 1000000, 1);
    }

    #[test(admin = @0x123, user = @0x456)]
    fun test_swap_a_for_b(admin: &signer, user: &signer) {
        simple_swap::create_pool(admin, 1000000, 1000000);
        let pool_addr = signer::address_of(admin);

        // Get quote before swap
        let expected_out = simple_swap::get_quote_a_to_b(pool_addr, 10000);
        assert!(expected_out > 0, 0);

        // Execute swap
        simple_swap::swap_a_for_b(user, pool_addr, 10000, 1);

        // Verify reserves changed
        let (reserve_a, reserve_b) = simple_swap::get_reserves(pool_addr);
        assert!(reserve_a == 1010000, 1); // Increased by input
        assert!(reserve_b < 1000000, 2);  // Decreased by output
    }

    #[test(admin = @0x123, user = @0x456)]
    fun test_swap_b_for_a(admin: &signer, user: &signer) {
        simple_swap::create_pool(admin, 1000000, 1000000);
        let pool_addr = signer::address_of(admin);

        simple_swap::swap_b_for_a(user, pool_addr, 10000, 1);

        let (reserve_a, reserve_b) = simple_swap::get_reserves(pool_addr);
        assert!(reserve_a < 1000000, 0);  // Decreased
        assert!(reserve_b == 1010000, 1); // Increased
    }

    #[test(admin = @0x123, provider = @0x456)]
    fun test_add_liquidity(admin: &signer, provider: &signer) {
        simple_swap::create_pool(admin, 1000000, 1000000);
        let pool_addr = signer::address_of(admin);

        simple_swap::add_liquidity(provider, pool_addr, 100000, 100000);

        let (reserve_a, reserve_b) = simple_swap::get_reserves(pool_addr);
        assert!(reserve_a == 1100000, 0);
        assert!(reserve_b == 1100000, 1);

        let lp_balance = simple_swap::get_lp_balance(signer::address_of(provider));
        assert!(lp_balance > 0, 2);
    }

    #[test(admin = @0x123, user = @0x456)]
    #[expected_failure(abort_code = 196613, location = sentinel_demo::simple_swap)]
    fun test_slippage_protection(admin: &signer, user: &signer) {
        simple_swap::create_pool(admin, 1000000, 1000000);
        let pool_addr = signer::address_of(admin);

        // Set min_amount_out too high - should fail
        simple_swap::swap_a_for_b(user, pool_addr, 10000, 999999);
    }

    #[test(admin = @0x123)]
    #[expected_failure(abort_code = 65542, location = sentinel_demo::simple_swap)]
    fun test_zero_amount_fails(admin: &signer) {
        simple_swap::create_pool(admin, 1000000, 1000000);
        let pool_addr = signer::address_of(admin);

        simple_swap::swap_a_for_b(admin, pool_addr, 0, 0); // Should fail
    }

    #[test(admin = @0x123)]
    #[expected_failure(abort_code = 524290, location = sentinel_demo::simple_swap)]
    fun test_double_pool_creation_fails(admin: &signer) {
        simple_swap::create_pool(admin, 1000000, 1000000);
        simple_swap::create_pool(admin, 500000, 500000); // Should fail
    }
}
