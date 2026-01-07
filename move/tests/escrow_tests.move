#[test_only]
module sentinel_demo::escrow_tests {
    use std::signer;
    use sentinel_demo::escrow;

    #[test(sender = @0x123)]
    fun test_create_escrow(sender: &signer) {
        escrow::create(sender, @0x456, 1000, 100);
        let addr = signer::address_of(sender);
        let (s, r, amount, deadline, status) = escrow::get_escrow(addr);
        assert!(s == addr, 0);
        assert!(r == @0x456, 1);
        assert!(amount == 1000, 2);
        assert!(deadline == 100, 3);
        assert!(status == 0, 4); // PENDING
    }

    #[test(sender = @0x123, recipient = @0x456)]
    fun test_claim_escrow(sender: &signer, recipient: &signer) {
        escrow::create(sender, @0x456, 1000, 100);
        let escrow_addr = signer::address_of(sender);

        // Claim before deadline
        escrow::claim(recipient, escrow_addr, 50);

        let (_, _, _, _, status) = escrow::get_escrow(escrow_addr);
        assert!(status == 1, 0); // CLAIMED
    }

    #[test(sender = @0x123)]
    fun test_refund_after_deadline(sender: &signer) {
        escrow::create(sender, @0x456, 1000, 100);

        // Refund after deadline
        escrow::refund(sender, 150);

        let escrow_addr = signer::address_of(sender);
        let (_, _, _, _, status) = escrow::get_escrow(escrow_addr);
        assert!(status == 2, 0); // REFUNDED
    }

    #[test(sender = @0x123)]
    fun test_cancel_escrow(sender: &signer) {
        escrow::create(sender, @0x456, 1000, 100);
        escrow::cancel(sender);
        // Escrow should no longer exist
    }

    #[test(sender = @0x123)]
    fun test_is_claimable(sender: &signer) {
        escrow::create(sender, @0x456, 1000, 100);
        let addr = signer::address_of(sender);

        assert!(escrow::is_claimable(addr, 50), 0);  // Before deadline
        assert!(escrow::is_claimable(addr, 100), 1); // At deadline
        assert!(!escrow::is_claimable(addr, 101), 2); // After deadline
    }

    #[test(sender = @0x123)]
    fun test_is_refundable(sender: &signer) {
        escrow::create(sender, @0x456, 1000, 100);
        let addr = signer::address_of(sender);

        assert!(!escrow::is_refundable(addr, 50), 0);  // Before deadline
        assert!(!escrow::is_refundable(addr, 100), 1); // At deadline
        assert!(escrow::is_refundable(addr, 101), 2);  // After deadline
    }

    #[test(sender = @0x123, wrong_recipient = @0x789)]
    #[expected_failure(abort_code = 327683, location = sentinel_demo::escrow)]
    fun test_wrong_recipient_cannot_claim(sender: &signer, wrong_recipient: &signer) {
        escrow::create(sender, @0x456, 1000, 100);
        let escrow_addr = signer::address_of(sender);

        // Wrong recipient tries to claim
        escrow::claim(wrong_recipient, escrow_addr, 50);
    }

    #[test(sender = @0x123, recipient = @0x456)]
    #[expected_failure(abort_code = 196614, location = sentinel_demo::escrow)]
    fun test_cannot_claim_after_deadline(sender: &signer, recipient: &signer) {
        escrow::create(sender, @0x456, 1000, 100);
        let escrow_addr = signer::address_of(sender);

        // Try to claim after deadline
        escrow::claim(recipient, escrow_addr, 150);
    }

    #[test(sender = @0x123)]
    #[expected_failure(abort_code = 196613, location = sentinel_demo::escrow)]
    fun test_cannot_refund_before_deadline(sender: &signer) {
        escrow::create(sender, @0x456, 1000, 100);

        // Try to refund before deadline
        escrow::refund(sender, 50);
    }

    #[test(sender = @0x123, recipient = @0x456)]
    #[expected_failure(abort_code = 196612, location = sentinel_demo::escrow)]
    fun test_cannot_double_claim(sender: &signer, recipient: &signer) {
        escrow::create(sender, @0x456, 1000, 100);
        let escrow_addr = signer::address_of(sender);

        escrow::claim(recipient, escrow_addr, 50);
        escrow::claim(recipient, escrow_addr, 60); // Should fail
    }
}
