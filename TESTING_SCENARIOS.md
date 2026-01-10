# Sentinel Advanced Testing Scenarios

Comprehensive test cases for impressing judges during demo. These go beyond basic examples to showcase edge cases, complex operations, and real-world DeFi scenarios.

---

## Quick Reference: Real Module Addresses

| Module | Testnet Address | Description |
|--------|-----------------|-------------|
| Aptos Framework | `0x1` | Core modules (coin, account, etc.) |
| Token Objects | `0x4` | NFT/Token object modules |
| Math64 | `0x1` | Math operations |
| String Utils | `0x1` | String manipulation |
| Vector | `0x1` | Vector operations |
| Table | `0x1` | Table data structure |
| Event | `0x1` | Event emission |

---

## 1. TRANSACTION SIMULATOR - Advanced Test Cases

### Category A: Different Data Types

#### A1. Large Numbers (u64 max)
```
Module Address: 0x1
Module Name: coin
Function Name: balance
Type Args: ["0x1::aptos_coin::AptosCoin"]
Args: ["0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"]
View: true
```

#### A2. Vector Arguments
```
Module Address: 0x1
Module Name: aptos_account
Function Name: batch_transfer
Type Args: []
Args: [
  ["0x2", "0x3", "0x4", "0x5"],
  [1000000, 2000000, 3000000, 4000000]
]
View: false
Max Gas: 500000
```

#### A3. Nested Struct Arguments (Object Token)
```
Module Address: 0x4
Module Name: collection
Function Name: create_collection_address
Type Args: []
Args: ["0x1", "MyCollection"]
View: true
```

#### A4. Boolean Arguments
```
Module Address: 0x1
Module Name: coin
Function Name: is_account_registered
Type Args: ["0x1::aptos_coin::AptosCoin"]
Args: ["0x1"]
View: true
```

#### A5. Empty Vector
```
Module Address: 0x1
Module Name: vector
Function Name: length
Type Args: ["u64"]
Args: [[]]
View: true
```

### Category B: Complex Type Arguments

#### B1. Multiple Type Arguments
```
Module Address: 0x1
Module Name: coin
Function Name: paired_metadata
Type Args: ["0x1::aptos_coin::AptosCoin", "0x1::aptos_coin::AptosCoin"]
Args: []
View: true
```

#### B2. Generic Type with Object
```
Module Address: 0x4
Module Name: token
Function Name: royalty
Type Args: ["0x4::token::Token"]
Args: ["0x4::token::Token<0x1::object::ObjectCore>"]
View: true
```

#### B3. Deeply Nested Types
```
Module Address: 0x1
Module Name: option
Function Name: is_some
Type Args: ["vector<0x1::string::String>"]
Args: [{"vec": []}]
View: true
```

### Category C: Entry Functions (State Changing)

#### C1. Token Transfer with Exact Amount
```
Module Address: 0x1
Module Name: aptos_account
Function Name: transfer
Type Args: []
Args: ["0x742d35Cc6634C0532925a3b844Bc9e7595f5aBcD", "100000000"]
View: false
Max Gas: 100000
Note: 1 MOVE = 100000000 (8 decimals)
```

#### C2. Create Resource Account
```
Module Address: 0x1
Module Name: resource_account
Function Name: create_resource_account
Type Args: []
Args: [[1, 2, 3, 4, 5, 6, 7, 8], []]
View: false
Max Gas: 200000
Note: Seed is byte vector, capability is empty vector
```

#### C3. Coin Register
```
Module Address: 0x1
Module Name: managed_coin
Function Name: register
Type Args: ["0x1::aptos_coin::AptosCoin"]
Args: []
View: false
Max Gas: 50000
```

### Category D: Edge Cases & Error Scenarios

#### D1. Invalid Module Address (Should Error)
```
Module Address: 0xdeadbeef123456789
Module Name: nonexistent
Function Name: fake_function
Type Args: []
Args: []
View: true
Expected: "Module not found" error
```

#### D2. Wrong Argument Count (Should Error)
```
Module Address: 0x1
Module Name: coin
Function Name: balance
Type Args: ["0x1::aptos_coin::AptosCoin"]
Args: []
View: true
Expected: "Missing required argument" error
```

#### D3. Type Mismatch (Should Error)
```
Module Address: 0x1
Module Name: coin
Function Name: balance
Type Args: ["0x1::aptos_coin::AptosCoin"]
Args: [12345]
View: true
Expected: "Invalid argument type - expected address" error
```

#### D4. Insufficient Gas (Should Error)
```
Module Address: 0x1
Module Name: aptos_account
Function Name: batch_transfer
Type Args: []
Args: [["0x2", "0x3", "0x4"], [1000000, 2000000, 3000000]]
View: false
Max Gas: 100
Expected: "Out of gas" error
```

#### D5. Zero Address
```
Module Address: 0x0
Module Name: coin
Function Name: balance
Type Args: ["0x1::aptos_coin::AptosCoin"]
Args: ["0x0"]
View: true
```

### Category E: DeFi Operations

#### E1. Check LP Token Balance
```
Module Address: 0x1
Module Name: coin
Function Name: balance
Type Args: ["0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::lp_coin::LP<0x1::aptos_coin::AptosCoin, 0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T>"]
Args: ["0x1"]
View: true
```

#### E2. AMM Swap Quote
```
Module Address: 0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12
Module Name: scripts_v2
Function Name: get_amount_out
Type Args: ["0x1::aptos_coin::AptosCoin", "0x5e156f1207d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T"]
Args: [100000000]
View: true
```

---

## 2. DEBUGGER - Advanced Test Cases

### Category A: Multi-Step Execution Traces

#### A1. Recursive Function (Fibonacci)
```
Module Address: 0x1
Module Name: math64
Function Name: pow
Sender: 0x1
Type Args: []
Args: 2, 10
Expected: Shows recursive calls, stack depth
```

#### A2. Loop with Multiple Iterations
```
Module Address: 0x1
Module Name: vector
Function Name: reverse
Sender: 0x1
Type Args: u64
Args: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
Expected: Shows loop iterations, memory changes
```

#### A3. Conditional Branching
```
Module Address: 0x1
Module Name: option
Function Name: get_with_default
Sender: 0x1
Type Args: u64
Args: {"vec": []}, 42
Expected: Shows branch taken for None case
```

### Category B: Cross-Module Calls

#### B1. Coin Transfer (Multi-module)
```
Module Address: 0x1
Module Name: aptos_account
Function Name: transfer
Sender: 0x1
Type Args:
Args: "0x2", "1000000"
Expected: Shows calls to coin::withdraw, coin::deposit
```

#### B2. Token Operations
```
Module Address: 0x4
Module Name: token
Function Name: name
Sender: 0x1
Type Args: 0x4::token::Token
Args: "0x4::token::Token<0x1::object::ObjectCore>"
Expected: Shows object resolution, string operations
```

### Category C: Gas Tracking Deep Dives

#### C1. High Gas Function
```
Module Address: 0x1
Module Name: string
Function Name: utf8
Sender: 0x1
Type Args:
Args: [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]
Expected: Shows gas per byte validation
```

#### C2. Table Operations (Storage Heavy)
```
Module Address: 0x1
Module Name: table
Function Name: new
Sender: 0x1
Type Args: u64, u64
Args:
Expected: Shows storage gas costs
```

### Category D: Error Path Debugging

#### D1. Abort with Code
```
Module Address: 0x1
Module Name: coin
Function Name: withdraw
Sender: 0x1
Type Args: 0x1::aptos_coin::AptosCoin
Args: "0x1", 999999999999999999
Expected: Shows abort at EINSUFFICIENT_BALANCE
```

#### D2. Assert Failure
```
Module Address: 0x1
Module Name: vector
Function Name: borrow
Sender: 0x1
Type Args: u64
Args: [1, 2, 3], 100
Expected: Shows EINDEX_OUT_OF_BOUNDS abort
```

---

## 3. MOVE PROVER - Advanced Test Cases

### Category A: Arithmetic Overflow Specs

#### A1. Safe Addition with Overflow Check
```move
module 0x1::safe_math {
    const MAX_U64: u64 = 18446744073709551615;

    spec safe_add {
        aborts_if a + b > MAX_U64;
        ensures result == a + b;
    }
    public fun safe_add(a: u64, b: u64): u64 {
        assert!(a <= MAX_U64 - b, 1);
        a + b
    }

    spec safe_mul {
        aborts_if a > 0 && b > MAX_U64 / a;
        ensures result == a * b;
    }
    public fun safe_mul(a: u64, b: u64): u64 {
        if (a == 0) return 0;
        assert!(b <= MAX_U64 / a, 2);
        a * b
    }
}
```

#### A2. Underflow Protection
```move
module 0x1::safe_sub {
    spec safe_subtract {
        aborts_if b > a;
        ensures result == a - b;
        ensures result <= a;
    }
    public fun safe_subtract(a: u64, b: u64): u64 {
        assert!(a >= b, 1);
        a - b
    }
}
```

### Category B: State Invariants

#### B1. Balance Conservation
```move
module 0x1::token_vault {
    struct Vault has key {
        total_supply: u64,
        reserves: u64,
        user_balances: u64,
    }

    // Global invariant: reserves + user_balances == total_supply
    spec module {
        invariant forall addr: address where exists<Vault>(addr):
            global<Vault>(addr).reserves + global<Vault>(addr).user_balances
            == global<Vault>(addr).total_supply;
    }

    spec deposit {
        let vault = global<Vault>(@0x1);
        aborts_if vault.user_balances + amount > MAX_U64;
        ensures global<Vault>(@0x1).user_balances == old(global<Vault>(@0x1).user_balances) + amount;
        ensures global<Vault>(@0x1).reserves == old(global<Vault>(@0x1).reserves) - amount;
    }
    public fun deposit(amount: u64) acquires Vault {
        let vault = borrow_global_mut<Vault>(@0x1);
        vault.user_balances = vault.user_balances + amount;
        vault.reserves = vault.reserves - amount;
    }
}
```

#### B2. Non-Negative Balance Invariant
```move
module 0x1::account_invariants {
    struct Account has key {
        balance: u64,
        nonce: u64,
    }

    spec module {
        // Nonce only increases
        invariant update forall addr: address where old(exists<Account>(addr)) && exists<Account>(addr):
            global<Account>(addr).nonce >= old(global<Account>(addr).nonce);
    }

    spec increment_nonce {
        aborts_if global<Account>(addr).nonce == MAX_U64;
        ensures global<Account>(addr).nonce == old(global<Account>(addr).nonce) + 1;
    }
    public fun increment_nonce(addr: address) acquires Account {
        let account = borrow_global_mut<Account>(addr);
        account.nonce = account.nonce + 1;
    }
}
```

### Category C: Access Control Specs

#### C1. Owner-Only Functions
```move
module 0x1::access_control {
    struct AdminCap has key { admin: address }

    const E_NOT_ADMIN: u64 = 1;

    spec only_admin {
        aborts_if !exists<AdminCap>(signer::address_of(admin));
        aborts_if global<AdminCap>(signer::address_of(admin)).admin != signer::address_of(admin);
    }
    public fun only_admin(admin: &signer, action: u64): bool acquires AdminCap {
        let addr = signer::address_of(admin);
        assert!(exists<AdminCap>(addr), E_NOT_ADMIN);
        let cap = borrow_global<AdminCap>(addr);
        assert!(cap.admin == addr, E_NOT_ADMIN);
        true
    }
}
```

#### C2. Multi-Sig Verification
```move
module 0x1::multisig {
    struct Proposal has key {
        threshold: u64,
        signatures: u64,
        executed: bool,
    }

    spec execute_proposal {
        let proposal = global<Proposal>(proposal_addr);
        aborts_if !exists<Proposal>(proposal_addr);
        aborts_if proposal.signatures < proposal.threshold;
        aborts_if proposal.executed;
        ensures global<Proposal>(proposal_addr).executed == true;
    }
    public fun execute_proposal(proposal_addr: address) acquires Proposal {
        let proposal = borrow_global_mut<Proposal>(proposal_addr);
        assert!(proposal.signatures >= proposal.threshold, 1);
        assert!(!proposal.executed, 2);
        proposal.executed = true;
    }
}
```

### Category D: DeFi Protocol Specs

#### D1. AMM Constant Product Invariant
```move
module 0x1::amm {
    struct Pool has key {
        reserve_x: u64,
        reserve_y: u64,
        k: u128,
    }

    spec module {
        // k = reserve_x * reserve_y (with some tolerance for rounding)
        invariant forall addr: address where exists<Pool>(addr):
            (global<Pool>(addr).reserve_x as u128) * (global<Pool>(addr).reserve_y as u128) >= global<Pool>(addr).k;
    }

    spec swap_x_to_y {
        let pool = global<Pool>(@0x1);
        let new_reserve_x = pool.reserve_x + amount_in;
        let new_reserve_y = ((pool.k / (new_reserve_x as u128)) as u64);

        aborts_if amount_in == 0;
        aborts_if pool.reserve_y <= new_reserve_y;
        ensures result == pool.reserve_y - new_reserve_y;
    }
    public fun swap_x_to_y(amount_in: u64): u64 acquires Pool {
        assert!(amount_in > 0, 1);
        let pool = borrow_global_mut<Pool>(@0x1);
        let new_reserve_x = pool.reserve_x + amount_in;
        let new_reserve_y = ((pool.k / (new_reserve_x as u128)) as u64);
        let amount_out = pool.reserve_y - new_reserve_y;
        pool.reserve_x = new_reserve_x;
        pool.reserve_y = new_reserve_y;
        amount_out
    }
}
```

#### D2. Lending Pool Collateral Ratio
```move
module 0x1::lending {
    struct Position has key {
        collateral: u64,
        debt: u64,
    }

    const COLLATERAL_RATIO: u64 = 150; // 150%
    const E_UNDERCOLLATERALIZED: u64 = 1;

    spec borrow {
        let position = global<Position>(user);
        let new_debt = position.debt + amount;

        aborts_if !exists<Position>(user);
        aborts_if position.collateral * 100 < new_debt * COLLATERAL_RATIO;
        ensures global<Position>(user).debt == old(global<Position>(user).debt) + amount;
    }
    public fun borrow(user: address, amount: u64) acquires Position {
        let position = borrow_global_mut<Position>(user);
        let new_debt = position.debt + amount;
        assert!(position.collateral * 100 >= new_debt * COLLATERAL_RATIO, E_UNDERCOLLATERALIZED);
        position.debt = new_debt;
    }
}
```

### Category E: Expected Failures (Counterexamples)

#### E1. Missing Overflow Check (Should Fail)
```move
module 0x1::unsafe_math {
    // This spec SHOULD FAIL - demonstrates prover catching bugs
    spec unsafe_add {
        ensures result == a + b;
    }
    public fun unsafe_add(a: u64, b: u64): u64 {
        a + b // No overflow check!
    }
}
```
**Expected:** Prover finds counterexample with large a and b causing overflow

#### E2. Missing Access Check (Should Fail)
```move
module 0x1::unsafe_admin {
    struct Treasury has key { balance: u64 }

    // This spec SHOULD FAIL - function allows anyone to drain
    spec withdraw {
        ensures global<Treasury>(@0x1).balance == old(global<Treasury>(@0x1).balance) - amount;
    }
    public fun withdraw(amount: u64) acquires Treasury {
        let treasury = borrow_global_mut<Treasury>(@0x1);
        treasury.balance = treasury.balance - amount;
        // Missing: admin check!
    }
}
```
**Expected:** Prover reports missing access control

---

## 4. GAS PROFILER - Advanced Test Cases

### Category A: Storage-Heavy Operations

#### A1. Batch Transfer (N Recipients)
```
Module Address: 0x1
Module Name: aptos_account
Function Name: batch_transfer
Type Args: []
Args: [
  ["0x2", "0x3", "0x4", "0x5", "0x6", "0x7", "0x8", "0x9", "0xa", "0xb"],
  [100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000]
]
Expected: Shows linear gas scaling with recipients
```

#### A2. Create Multiple Objects
```
Module Address: 0x1
Module Name: object
Function Name: create_named_object
Type Args: []
Args: [[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]]
Expected: High storage gas for new object creation
```

### Category B: Computation-Heavy Operations

#### B1. Large Vector Sort
```
Module Address: 0x1
Module Name: vector
Function Name: reverse
Type Args: u64
Args: [[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50]]
Expected: Shows O(n) computation gas
```

#### B2. String Operations
```
Module Address: 0x1
Module Name: string
Function Name: utf8
Type Args: []
Args: [[72,101,108,108,111,32,87,111,114,108,100,33,32,84,104,105,115,32,105,115,32,97,32,108,111,110,103,101,114,32,115,116,114,105,110,103,32,102,111,114,32,116,101,115,116,105,110,103,32,103,97,115,46]]
Expected: Shows string validation gas per byte
```

### Category C: Cross-Contract Calls

#### C1. Nested Module Calls
```
Module Address: 0x1
Module Name: aptos_account
Function Name: transfer_coins
Type Args: ["0x1::aptos_coin::AptosCoin"]
Args: ["0x742d35Cc6634C0532925a3b844Bc9e7595f5aBcD", "100000000"]
Expected: Shows gas breakdown across coin, account, event modules
```

### Category D: Edge Cases

#### D1. Zero-Value Operations
```
Module Address: 0x1
Module Name: coin
Function Name: value
Type Args: ["0x1::aptos_coin::AptosCoin"]
Args: [{"value": 0}]
Expected: Minimal gas even with zero value
```

#### D2. Maximum Arguments
```
Module Address: 0x1
Module Name: aptos_account
Function Name: batch_transfer
Type Args: []
Args: [
  ["0x1","0x2","0x3","0x4","0x5","0x6","0x7","0x8","0x9","0xa","0xb","0xc","0xd","0xe","0xf","0x10","0x11","0x12","0x13","0x14","0x15","0x16","0x27","0x28","0x29","0x2a"],
  [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26]
]
Expected: Shows argument parsing gas scaling
```

---

## 5. STRESS TEST SCENARIOS

### Scenario 1: Full DeFi Flow
1. **Simulator:** Check token balance → 2. **Debugger:** Trace swap execution → 3. **Prover:** Verify swap invariants → 4. **Gas:** Profile swap costs

### Scenario 2: NFT Minting Pipeline
1. **Simulator:** Create collection → 2. **Simulator:** Mint token → 3. **Debugger:** Trace minting → 4. **Gas:** Profile minting costs

### Scenario 3: Governance Flow
1. **Simulator:** Create proposal → 2. **Simulator:** Vote on proposal → 3. **Prover:** Verify voting logic → 4. **Debugger:** Trace execution

---

## 6. COPY-PASTE READY TEST DATA

### Quick Simulator Tests
```json
// Test 1: Coin Balance
{"moduleAddress":"0x1","moduleName":"coin","functionName":"balance","typeArgs":["0x1::aptos_coin::AptosCoin"],"args":["\"0x1\""],"isView":true}

// Test 2: Transfer
{"moduleAddress":"0x1","moduleName":"aptos_account","functionName":"transfer","typeArgs":[],"args":["\"0x2\"","\"100000000\""],"isView":false,"maxGas":100000}

// Test 3: Batch Transfer
{"moduleAddress":"0x1","moduleName":"aptos_account","functionName":"batch_transfer","typeArgs":[],"args":["[\"0x2\",\"0x3\",\"0x4\"]","[1000000,2000000,3000000]"],"isView":false,"maxGas":500000}
```

### Quick Debugger Tests
```
// Test 1: Simple View
Module: 0x1, Name: coin, Function: balance, TypeArgs: 0x1::aptos_coin::AptosCoin, Args: "0x1"

// Test 2: Math Operation
Module: 0x1, Name: math64, Function: pow, TypeArgs: , Args: 2, 10

// Test 3: Vector Operation
Module: 0x1, Name: vector, Function: length, TypeArgs: u64, Args: [1,2,3,4,5]
```

---

## 7. EXPECTED BEHAVIORS CHEAT SHEET

| Input Type | Expected Behavior |
|------------|-------------------|
| Invalid module | "Module not found" error with module path |
| Wrong arg count | "Missing required argument" error |
| Type mismatch | "Type mismatch" error with expected vs received |
| Insufficient gas | "Out of gas" with gas consumed before failure |
| Abort code | Shows abort code and location in trace |
| Overflow | Prover catches, runtime aborts with specific code |
| Empty vector | Valid, returns 0 for length operations |
| Zero address (0x0) | Valid address, may have special handling |
| MAX_U64 | Valid, watch for +1 overflow |

---

## Notes for Demo

1. **Start simple** - Show basic balance check works
2. **Escalate complexity** - Add type args, vectors, nested types
3. **Show error handling** - Intentionally break things to show helpful errors
4. **DeFi scenarios** - These impress judges most
5. **Prover failures** - Showing it catches bugs is more impressive than all passing
6. **Gas comparisons** - Compare similar operations with different implementations
