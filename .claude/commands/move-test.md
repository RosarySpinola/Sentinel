---
description: Run Move tests and formal verification with Move Prover
argument: <module name or test to run>
---

# Move Test & Prove

Run Move unit tests and formal verification using Move Prover.

**NO GARBAGE FILES:** Do not create markdown, temp, or documentation files.

## Prerequisites

- Load `move-dev` skill
- Move CLI installed (`aptos` command available)
- Move.toml configured

### Context7 Lookups

```
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/aptos-labs/aptos-core",
  topic: "move prover",
  mode: "code"
})
```

## Steps

### 1. Run Unit Tests

```bash
cd move

# Run all tests
aptos move test

# Run specific test
aptos move test --filter test_name

# With coverage
aptos move test --coverage
```

### 2. Run Move Prover

```bash
cd move

# Prove all modules
aptos move prove

# Prove specific module
aptos move prove --filter module_name

# Verbose output
aptos move prove --verbose

# With timeout
aptos move prove --timeout 300
```

### 3. Check Prover Output

Look for:
- `Proving` status for each module
- `verified` count
- Any `error` or `counterexample` output

### 4. Fix Counterexamples

If prover finds counterexample:
1. Read the counterexample inputs
2. Trace through spec logic
3. Either fix the code or strengthen the spec
4. Re-run prover

## Common Prover Specs

```move
spec module_name {
    // Function spec
    spec function_name {
        // Preconditions
        requires amount > 0;

        // Postconditions
        ensures result > 0;

        // Abort conditions
        aborts_if amount > balance;
    }

    // Invariants
    invariant forall addr: address: balance(addr) >= 0;
}
```

## Success Checklist

- [ ] All unit tests pass
- [ ] Move Prover completes without errors
- [ ] No counterexamples found
- [ ] All specs verified

## Example Usage

```
/move-test Run all tests for the swap module
```

```
/move-test Verify formal specs for liquidity pool
```

## If This Fails

### Error: "prover timeout"
**Fix:** Increase timeout or simplify specs

### Error: "counterexample found"
**Fix:** Review spec conditions, check edge cases

### Error: "spec verification failed"
**Fix:** Check spec logic matches implementation
