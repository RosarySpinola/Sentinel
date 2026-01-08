# App Flow & Testing Guide

## Quick Start Testing

### 1. Start the Frontend (Required)

```bash
cd frontend
npm install
npm run dev
```
**URL:** http://localhost:3005

### 2. Start the API (Optional - for full simulation)

```bash
cd api
cargo run
```
**URL:** http://localhost:4004

---

## Manual Testing Flow

### Landing Page → `/`
1. Open http://localhost:3005
2. Verify "Sentinel" hero text displays
3. Check 4 feature cards: Transaction Simulator, Visual Debugger, Move Prover, Gas Profiler
4. Click "Launch App" → navigates to `/simulator`

### Simulator → `/simulator`
1. Select network (Mainnet/Testnet)
2. Connect wallet (Privy auth)
3. Enter module address, module name, function name
4. Add type arguments and function arguments
5. Click "Simulate" to run transaction simulation
6. Review: state changes, events, gas cost

### Debugger → `/debugger`
1. Navigate to `/debugger`
2. Click "Load Demo Session" for sample data
3. Use step controls (Step Over, Step Into, Step Out)
4. Inspect: call stack, local variables, gas per instruction
5. Or: Load real simulation result from Simulator

### Move Prover → `/prover`
1. Navigate to `/prover`
2. Paste Move module code in textarea
3. Click "Run Prover"
4. Review verification results: passing/failing specs

### Gas Profiler → `/gas`
1. Navigate to `/gas`
2. Click "Load Demo Profile" for sample data
3. Review gas breakdown by operation
4. View optimization suggestions

---

## Automated E2E Testing

### Run All Tests
```bash
cd frontend
npm test
```

### Run with UI (Interactive)
```bash
npm run test:ui
```

### Run with Browser Visible
```bash
npm run test:headed
```

### Test Files
| File | Tests |
|------|-------|
| `e2e/landing.spec.ts` | Hero, features, navigation |
| `e2e/simulator.spec.ts` | Form, network selector, results |
| `e2e/debugger.spec.ts` | Page load, demo session |
| `e2e/prover.spec.ts` | Textarea, run button |
| `e2e/gas.spec.ts` | Page load, demo profile |

---

## Full Stack Testing

### 1. Database Setup (if needed)
```bash
# Ensure PostgreSQL is running
# Set DATABASE_URL in api/.env
```

### 2. Start API
```bash
cd api
cargo run
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

### 4. Test Real Simulation
1. Go to `/simulator`
2. Connect wallet
3. Use these demo values:
   - Network: Testnet
   - Module: `0x1::coin`
   - Function: `balance`
   - Type Args: `0x1::aptos_coin::AptosCoin`
   - Args: `<your_address>`
4. Click Simulate

---

## Move Contract Testing

```bash
cd move
aptos move test      # Run unit tests
aptos move prove     # Run formal verification
```

---

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend (dev) | 3005 | http://localhost:3005 |
| Frontend (Playwright) | 3000 | http://localhost:3000 |
| API | 4004 | http://localhost:4004 |

---

## Dashboard Routes

| Route | Feature |
|-------|---------|
| `/` | Landing page |
| `/simulator` | Transaction Simulator |
| `/debugger` | Visual Debugger |
| `/prover` | Move Prover |
| `/gas` | Gas Profiler |
| `/history` | Transaction history |
| `/projects` | Project management |
| `/teams` | Team management |
| `/settings/api-keys` | API key management |
