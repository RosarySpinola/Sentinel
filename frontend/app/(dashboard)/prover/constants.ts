import type { ProverResult } from "./types";

// Demo prover result showing successful verification of the vault module
export const DEMO_PROVER_RESULT: ProverResult = {
  status: "passed",
  duration_ms: 1847,
  summary: "All 3 specifications verified successfully. No counterexamples found.",
  modules: [
    {
      name: "vault",
      status: "passed",
      specs: [
        {
          name: "deposit",
          function: "deposit",
          status: "passed",
        },
        {
          name: "withdraw",
          function: "withdraw",
          status: "passed",
        },
        {
          name: "calc_swap_output",
          function: "calc_swap_output",
          status: "passed",
        },
      ],
    },
  ],
  raw_output: `[INFO] Compiling module 0x1::vault
[INFO] Building dependency graph...
[INFO] Checking specification: deposit
  - aborts_if vault.balance + amount > MAX_U64 ✓
  - ensures result.balance == old(vault).balance + amount ✓
  - ensures result.total_deposits == old(vault).total_deposits + 1 ✓
[INFO] Checking specification: withdraw
  - aborts_if amount > vault.balance ✓
  - ensures result.balance == old(vault).balance - amount ✓
[INFO] Checking specification: calc_swap_output
  - requires reserve_in > 0 && reserve_out > 0 ✓
  - ensures result <= reserve_out ✓
[INFO] Running SMT solver...
[INFO] All specifications verified.
[SUCCESS] Verification completed in 1847ms`,
};

// Demo: Simple token vault with formal verification specs
// This example demonstrates Move Prover capabilities for DeFi safety
export const DEFAULT_CODE = `module 0x1::vault {
    /// A simple vault that tracks deposits
    struct Vault has key, store {
        balance: u64,
        total_deposits: u64,
    }

    /// Deposit funds into the vault
    /// Spec ensures balance never overflows and is correctly updated
    spec deposit {
        aborts_if vault.balance + amount > MAX_U64;
        ensures result.balance == old(vault).balance + amount;
        ensures result.total_deposits == old(vault).total_deposits + 1;
    }
    public fun deposit(vault: Vault, amount: u64): Vault {
        Vault {
            balance: vault.balance + amount,
            total_deposits: vault.total_deposits + 1,
        }
    }

    /// Withdraw funds from the vault
    /// Spec ensures you cannot withdraw more than available
    spec withdraw {
        aborts_if amount > vault.balance;
        ensures result.balance == old(vault).balance - amount;
    }
    public fun withdraw(vault: Vault, amount: u64): Vault {
        assert!(amount <= vault.balance, 1);
        Vault {
            balance: vault.balance - amount,
            total_deposits: vault.total_deposits,
        }
    }

    /// Calculate swap output (AMM formula)
    /// Spec verifies mathematical properties
    spec calc_swap_output {
        requires reserve_in > 0 && reserve_out > 0;
        ensures result <= reserve_out;
    }
    public fun calc_swap_output(
        amount_in: u64,
        reserve_in: u64,
        reserve_out: u64
    ): u64 {
        // Simplified constant product formula
        (amount_in * reserve_out) / (reserve_in + amount_in)
    }
}`;
