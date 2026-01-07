/// Escrow module for demonstrating conditional transfers
/// - Transaction simulation: Preview escrow operations
/// - Debugger: Step through claim/refund logic
/// - Move Prover: Verify fund safety invariants
module sentinel_demo::escrow {
    use std::signer;
    use std::error;

    /// Error codes
    const E_ESCROW_NOT_FOUND: u64 = 1;
    const E_ESCROW_ALREADY_EXISTS: u64 = 2;
    const E_NOT_AUTHORIZED: u64 = 3;
    const E_ALREADY_CLAIMED: u64 = 4;
    const E_DEADLINE_NOT_PASSED: u64 = 5;
    const E_DEADLINE_PASSED: u64 = 6;
    const E_ZERO_AMOUNT: u64 = 7;

    /// Escrow status
    const STATUS_PENDING: u8 = 0;
    const STATUS_CLAIMED: u8 = 1;
    const STATUS_REFUNDED: u8 = 2;

    /// Escrow holding funds between two parties
    struct Escrow has key {
        sender: address,
        recipient: address,
        amount: u64,
        deadline: u64,
        status: u8,
    }

    /// Create a new escrow
    public entry fun create(
        sender: &signer,
        recipient: address,
        amount: u64,
        deadline: u64
    ) {
        let sender_addr = signer::address_of(sender);
        assert!(!exists<Escrow>(sender_addr), error::already_exists(E_ESCROW_ALREADY_EXISTS));
        assert!(amount > 0, error::invalid_argument(E_ZERO_AMOUNT));

        move_to(sender, Escrow {
            sender: sender_addr,
            recipient,
            amount,
            deadline,
            status: STATUS_PENDING,
        });
    }

    /// Recipient claims the escrowed funds (before deadline)
    public entry fun claim(
        recipient: &signer,
        escrow_addr: address,
        current_time: u64
    ) acquires Escrow {
        assert!(exists<Escrow>(escrow_addr), error::not_found(E_ESCROW_NOT_FOUND));

        let escrow = borrow_global_mut<Escrow>(escrow_addr);
        let recipient_addr = signer::address_of(recipient);

        assert!(recipient_addr == escrow.recipient, error::permission_denied(E_NOT_AUTHORIZED));
        assert!(escrow.status == STATUS_PENDING, error::invalid_state(E_ALREADY_CLAIMED));
        assert!(current_time <= escrow.deadline, error::invalid_state(E_DEADLINE_PASSED));

        escrow.status = STATUS_CLAIMED;
        // In real implementation, would transfer funds here
    }

    /// Sender refunds after deadline passes
    public entry fun refund(
        sender: &signer,
        current_time: u64
    ) acquires Escrow {
        let escrow_addr = signer::address_of(sender);
        assert!(exists<Escrow>(escrow_addr), error::not_found(E_ESCROW_NOT_FOUND));

        let escrow = borrow_global_mut<Escrow>(escrow_addr);

        assert!(escrow.sender == escrow_addr, error::permission_denied(E_NOT_AUTHORIZED));
        assert!(escrow.status == STATUS_PENDING, error::invalid_state(E_ALREADY_CLAIMED));
        assert!(current_time > escrow.deadline, error::invalid_state(E_DEADLINE_NOT_PASSED));

        escrow.status = STATUS_REFUNDED;
        // In real implementation, would return funds here
    }

    /// Cancel escrow (only sender, only if pending)
    public entry fun cancel(sender: &signer) acquires Escrow {
        let escrow_addr = signer::address_of(sender);
        assert!(exists<Escrow>(escrow_addr), error::not_found(E_ESCROW_NOT_FOUND));

        let Escrow { sender: _, recipient: _, amount: _, deadline: _, status } =
            move_from<Escrow>(escrow_addr);

        assert!(status == STATUS_PENDING, error::invalid_state(E_ALREADY_CLAIMED));
    }

    // ============================================
    // View Functions
    // ============================================

    #[view]
    public fun get_escrow(addr: address): (address, address, u64, u64, u8) acquires Escrow {
        assert!(exists<Escrow>(addr), error::not_found(E_ESCROW_NOT_FOUND));
        let escrow = borrow_global<Escrow>(addr);
        (escrow.sender, escrow.recipient, escrow.amount, escrow.deadline, escrow.status)
    }

    #[view]
    public fun is_claimable(addr: address, current_time: u64): bool acquires Escrow {
        if (!exists<Escrow>(addr)) return false;
        let escrow = borrow_global<Escrow>(addr);
        escrow.status == STATUS_PENDING && current_time <= escrow.deadline
    }

    #[view]
    public fun is_refundable(addr: address, current_time: u64): bool acquires Escrow {
        if (!exists<Escrow>(addr)) return false;
        let escrow = borrow_global<Escrow>(addr);
        escrow.status == STATUS_PENDING && current_time > escrow.deadline
    }

    // ============================================
    // Move Prover Specifications
    // ============================================

    spec module {
        /// Status can only be PENDING, CLAIMED, or REFUNDED
        invariant forall addr: address where exists<Escrow>(addr):
            global<Escrow>(addr).status == STATUS_PENDING ||
            global<Escrow>(addr).status == STATUS_CLAIMED ||
            global<Escrow>(addr).status == STATUS_REFUNDED;

        /// Amount should always be positive
        invariant forall addr: address where exists<Escrow>(addr):
            global<Escrow>(addr).amount > 0;
    }

    spec create {
        aborts_if exists<Escrow>(signer::address_of(sender));
        aborts_if amount == 0;
        ensures exists<Escrow>(signer::address_of(sender));
        ensures global<Escrow>(signer::address_of(sender)).status == STATUS_PENDING;
        ensures global<Escrow>(signer::address_of(sender)).amount == amount;
    }

    spec claim {
        aborts_if !exists<Escrow>(escrow_addr);
        aborts_if global<Escrow>(escrow_addr).recipient != signer::address_of(recipient);
        aborts_if global<Escrow>(escrow_addr).status != STATUS_PENDING;
        aborts_if current_time > global<Escrow>(escrow_addr).deadline;
        ensures global<Escrow>(escrow_addr).status == STATUS_CLAIMED;
    }

    spec refund {
        let escrow_addr = signer::address_of(sender);
        aborts_if !exists<Escrow>(escrow_addr);
        aborts_if global<Escrow>(escrow_addr).sender != escrow_addr;
        aborts_if global<Escrow>(escrow_addr).status != STATUS_PENDING;
        aborts_if current_time <= global<Escrow>(escrow_addr).deadline;
        ensures global<Escrow>(escrow_addr).status == STATUS_REFUNDED;
    }

    spec cancel {
        let escrow_addr = signer::address_of(sender);
        aborts_if !exists<Escrow>(escrow_addr);
        aborts_if global<Escrow>(escrow_addr).status != STATUS_PENDING;
        ensures !exists<Escrow>(escrow_addr);
    }
}
