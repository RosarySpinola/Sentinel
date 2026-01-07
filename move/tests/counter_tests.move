#[test_only]
module sentinel_demo::counter_tests {
    use std::signer;
    use sentinel_demo::counter;

    #[test(account = @0x123)]
    fun test_initialize(account: &signer) {
        counter::initialize(account);
        let addr = signer::address_of(account);
        assert!(counter::is_initialized(addr), 0);
        assert!(counter::get_value(addr) == 0, 1);
    }

    #[test(account = @0x123)]
    fun test_increment(account: &signer) {
        counter::initialize(account);
        let addr = signer::address_of(account);

        counter::increment(account, 5);
        assert!(counter::get_value(addr) == 5, 0);

        counter::increment(account, 10);
        assert!(counter::get_value(addr) == 15, 1);
    }

    #[test(account = @0x123)]
    fun test_decrement(account: &signer) {
        counter::initialize(account);
        let addr = signer::address_of(account);

        counter::increment(account, 100);
        counter::decrement(account, 30);
        assert!(counter::get_value(addr) == 70, 0);
    }

    #[test(account = @0x123)]
    fun test_reset(account: &signer) {
        counter::initialize(account);
        let addr = signer::address_of(account);

        counter::increment(account, 500);
        counter::reset(account);
        assert!(counter::get_value(addr) == 0, 0);
    }

    #[test(account = @0x123)]
    #[expected_failure(abort_code = 524289, location = sentinel_demo::counter)]
    fun test_double_initialize_fails(account: &signer) {
        counter::initialize(account);
        counter::initialize(account); // Should fail
    }

    #[test(account = @0x123)]
    #[expected_failure(abort_code = 393217, location = sentinel_demo::counter)]
    fun test_increment_without_init_fails(account: &signer) {
        counter::increment(account, 5); // Should fail
    }

    #[test(account = @0x123)]
    #[expected_failure(abort_code = 196612, location = sentinel_demo::counter)]
    fun test_underflow_fails(account: &signer) {
        counter::initialize(account);
        counter::increment(account, 10);
        counter::decrement(account, 20); // Should fail - underflow
    }

    #[test(account = @0x123)]
    #[expected_failure(abort_code = 196611, location = sentinel_demo::counter)]
    fun test_overflow_fails(account: &signer) {
        counter::initialize(account);
        counter::increment(account, 1000001); // Should fail - exceeds MAX_COUNTER
    }
}
