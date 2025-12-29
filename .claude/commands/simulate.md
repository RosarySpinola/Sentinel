---
description: Test transaction simulation locally
argument: <module::function to simulate>
---

# Simulate Transaction

Test the simulation engine locally against Movement Network.

**NO GARBAGE FILES:** Do not create markdown, temp, or documentation files.

## Prerequisites

- Load `api-dev` skill
- API server running locally
- Movement Network RPC accessible

### Context7 Lookups

```
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/aptos-labs/aptos-ts-sdk",
  topic: "simulateTransaction",
  mode: "code"
})
```

## Steps

### 1. Start Local API Server

```bash
cd api && cargo run
# or
cd api && npm run dev
```

### 2. Test Simulation Endpoint

```bash
# Basic simulation test
curl -X POST http://localhost:3001/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "network": "testnet",
    "sender": "0x1",
    "payload": {
      "function": "0x1::coin::balance",
      "type_arguments": ["0x1::aptos_coin::AptosCoin"],
      "arguments": ["0x1"]
    }
  }'
```

### 3. Verify Response

Check for:
- `success` field (boolean)
- `gas_used` field (number)
- `state_changes` array
- `events` array

### 4. Test State Changes

```bash
# Test a transfer simulation
curl -X POST http://localhost:3001/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "network": "testnet",
    "sender": "0xYOUR_ADDRESS",
    "payload": {
      "function": "0x1::coin::transfer",
      "type_arguments": ["0x1::aptos_coin::AptosCoin"],
      "arguments": ["0xRECIPIENT", "1000000"]
    }
  }'
```

## Success Checklist

- [ ] API server starts without errors
- [ ] Simulation endpoint responds
- [ ] State changes are calculated correctly
- [ ] Gas estimation is reasonable
- [ ] Events are captured

## Example Usage

```
/simulate 0x1::coin::transfer with 1 APT to test address
```

```
/simulate Custom DEX swap function on testnet
```
