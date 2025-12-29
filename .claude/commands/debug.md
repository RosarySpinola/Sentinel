---
description: Strategic debugging across frontend, API, and Move modules
argument: <error description or unexpected behavior>
---

# Full-Stack Debug

Strategic debugging system that identifies issues across the entire stack: **frontend <-> API <-> Movement Node**.

**NO GARBAGE FILES:** Do not create markdown, temp, or documentation files.

## Prerequisites

- Identify which layer(s) the error originates from
- Load relevant skill (`ui-dev`, `api-dev`, `move-dev`)

### Context7 Lookups (for debugging patterns)

If unsure about debugging techniques:
- Aptos SDK: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/aptos-labs/aptos-ts-sdk", topic: "error handling" })`
- Next.js: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/vercel/next.js", topic: "debugging" })`

## Debug Strategy

### Phase 1: Classify the Issue

| Symptom | Primary Layer | Check Also |
|---------|---------------|------------|
| Simulation fails | API | Frontend (wrong params), Movement Node (RPC) |
| UI shows wrong data | Frontend | API (wrong response format) |
| Prover times out | API | Move module (complex specs) |
| API returns 500 | API | Movement Node (connection) |
| State changes missing | API | Simulation logic |

### Phase 2: Layer-Specific Debugging

#### Frontend Issues

1. **API Call Failures:**
   - Check browser console for errors
   - Verify API endpoint URL
   - Check request payload format

2. **State Display Issues:**
   - Add console.log to hooks
   - Check React Query cache
   - Verify response parsing

#### API Issues

1. **Simulation Failures:**
   ```bash
   # Test simulation endpoint directly
   curl -X POST http://localhost:3001/api/simulate \
     -H "Content-Type: application/json" \
     -d '{"network":"testnet","sender":"0x1","function":"0x1::coin::balance"}'
   ```

2. **Movement Node Connection:**
   ```bash
   # Test RPC connection
   curl https://testnet.movementnetwork.xyz/v1
   ```

#### Move Module Issues

1. **Prover Failures:**
   ```bash
   # Run prover with verbose output
   aptos move prove --package-dir ./move --verbose
   ```

2. **Test Failures:**
   ```bash
   # Run Move tests
   aptos move test --package-dir ./move
   ```

### Phase 3: Common Integration Bugs

| Bug Pattern | Cause | Fix |
|-------------|-------|-----|
| Simulation works, UI shows error | Response parsing | Check type mapping |
| API works, frontend shows stale | React Query cache | Add refetch logic |
| Prover passes, simulation fails | Spec doesn't match runtime | Review specs |

### Debug Checklist

```
□ Reproduced the issue
□ Identified which layer (frontend/API/Move)
□ Checked network connectivity
□ Checked request/response format
□ Read error messages carefully
□ Tested component in isolation
□ Fixed and verified resolution
```

## Example Usage

```
/debug Simulation returns success but no state changes are displayed in UI
```

```
/debug Move Prover keeps timing out on the swap module
```

```
/debug API returns 500 when simulating transactions on mainnet
```
