# PRD: Sentinel — Move Prover GUI & CI Integration

## Track: Best New DevEx Tool on Movement

---

## Executive Summary

Sentinel is Tenderly for Movement — a transaction simulator, debugger, and formal verification dashboard. It makes Move Prover accessible through a visual interface and integrates with CI/CD pipelines to catch bugs before deployment.

---

## Problem Statement

Movement developers currently suffer from:

1. **No transaction simulation:** Can't preview tx effects before signing
2. **Poor debugging:** Stack traces are cryptic, no call visualization
3. **Move Prover is CLI-only:** Powerful but unusable for most devs
4. **No gas profiling:** Can't optimize without trial and error
5. **Missing CI integration:** No automated contract verification

**Existing Tools Gap:**

| Tool | Ethereum | Movement |
|------|----------|----------|
| Transaction simulation | Tenderly ✅ | ❌ |
| Visual debugger | Remix, Foundry ✅ | ❌ |
| Formal verification UI | Certora ✅ | ❌ |
| Gas profiler | Foundry ✅ | ❌ |
| CI/CD integration | Multiple ✅ | ❌ |

---

## Solution Overview

Sentinel provides:

1. **Transaction Simulator** — Preview any transaction before execution
2. **Visual Debugger** — Step through execution with state diffs
3. **Move Prover Dashboard** — Run formal verification with visual results
4. **Gas Profiler** — Identify expensive operations
5. **CI/CD Integration** — GitHub Action for automated checks

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Sentinel Dashboard                       │
│              (Next.js + React + Monaco Editor)              │
│  - Transaction simulation UI                                 │
│  - Debugger visualization                                    │
│  - Prover results display                                    │
│  - Gas profiling charts                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Sentinel API                             │
│                 (Rust / Node.js Backend)                    │
│  - Simulation engine                                         │
│  - Prover orchestration                                      │
│  - Project management                                        │
│  - Webhook handling                                          │
└─────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   Movement Node  │ │   Move Prover    │ │   GitHub API     │
│   (RPC/GraphQL)  │ │   (CLI Wrapper)  │ │   (CI/CD)        │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

### Core Components

#### 1. Transaction Simulator

```typescript
// Simulation Request
interface SimulationRequest {
  network: 'mainnet' | 'testnet' | 'local';
  transaction: {
    sender: string;
    module: string;
    function: string;
    type_args: string[];
    args: any[];
    max_gas: number;
  };
  // Optional: override state for testing
  state_overrides?: {
    address: string;
    resource: string;
    value: any;
  }[];
}

// Simulation Response
interface SimulationResult {
  success: boolean;
  gas_used: number;
  gas_unit_price: number;

  // State changes
  state_changes: {
    address: string;
    resource: string;
    before: any;
    after: any;
    diff: JsonDiff;
  }[];

  // Events emitted
  events: {
    type: string;
    data: any;
    sequence_number: number;
  }[];

  // Execution trace
  trace: ExecutionStep[];

  // Error details (if failed)
  error?: {
    code: number;
    message: string;
    location: SourceLocation;
  };
}
```

#### 2. Visual Debugger

```typescript
interface ExecutionStep {
  step_number: number;
  instruction: string;
  module: string;
  function: string;
  line_number: number;

  // Stack state
  stack: StackFrame[];

  // Local variables
  locals: {
    name: string;
    type: string;
    value: any;
  }[];

  // Gas consumed this step
  gas_delta: number;
  gas_total: number;
}

interface StackFrame {
  module: string;
  function: string;
  locals: Map<string, any>;
  return_type: string;
}
```

#### 3. Move Prover Dashboard

```typescript
interface ProverConfig {
  project_path: string;
  modules: string[];  // Which modules to verify
  timeout_seconds: number;

  // Spec options
  verify_specs: boolean;
  verify_invariants: boolean;
  verify_aborts: boolean;
}

interface ProverResult {
  status: 'passed' | 'failed' | 'timeout' | 'error';
  duration_ms: number;

  modules: {
    name: string;
    status: 'passed' | 'failed';

    specs: {
      name: string;
      location: SourceLocation;
      status: 'passed' | 'failed';
      counterexample?: Counterexample;
    }[];

    invariants: {
      name: string;
      status: 'passed' | 'failed';
      violated_at?: SourceLocation;
    }[];
  }[];

  // Human-readable summary
  summary: string;
}

interface Counterexample {
  // Input values that violate the spec
  inputs: Map<string, any>;
  // Execution trace showing violation
  trace: ExecutionStep[];
  // Specific assertion that failed
  failed_assertion: string;
}
```

#### 4. Gas Profiler

```typescript
interface GasProfile {
  total_gas: number;

  // Breakdown by operation
  by_operation: {
    operation: string;  // 'move_to', 'borrow_global', 'vector_push', etc.
    count: number;
    total_gas: number;
    percentage: number;
  }[];

  // Breakdown by function
  by_function: {
    module: string;
    function: string;
    gas_used: number;
    percentage: number;
    hotspots: {
      line: number;
      gas: number;
      suggestion?: string;
    }[];
  }[];

  // Optimization suggestions
  suggestions: {
    severity: 'info' | 'warning' | 'critical';
    message: string;
    location: SourceLocation;
    estimated_savings: number;
  }[];
}
```

#### 5. CI/CD GitHub Action

```yaml
# .github/workflows/Sentinel.yml
name: Sentinel CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Sentinel Verify
        uses: Sentinel/action@v1
        with:
          api_key: ${{ secrets.Sentinel_API_KEY }}
          project_path: ./contracts

          # What to check
          run_prover: true
          run_simulation: true
          gas_threshold: 100000  # Fail if any function exceeds

          # Simulation scenarios
          scenarios: |
            - name: "Basic swap"
              function: "dex::swap"
              args: ["100", "0"]
              expect_success: true
            - name: "Insufficient balance"
              function: "dex::swap"
              args: ["1000000000", "0"]
              expect_error: "E_INSUFFICIENT_BALANCE"

      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: Sentinel-report
          path: Sentinel-report.html
```

---

## Feature Specifications

### MVP (Hackathon Scope)

| Feature | Priority | Effort | Status |
|---------|----------|--------|--------|
| Transaction simulation | P0 | High | 🔲 |
| Basic execution trace | P0 | Medium | 🔲 |
| Gas usage display | P0 | Low | 🔲 |
| Web dashboard UI | P0 | High | 🔲 |
| Testnet integration | P0 | Medium | 🔲 |

### Post-MVP Features

| Feature | Priority | Effort |
|---------|----------|--------|
| Move Prover integration | P1 | High |
| Visual debugger (step-through) | P1 | High |
| GitHub Action | P1 | Medium |
| Gas optimization suggestions | P1 | Medium |
| Team workspaces | P2 | Medium |
| Historical tx analysis | P2 | Medium |
| Alerts & monitoring | P2 | High |

---

## User Interface Design

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🔍 Sentinel                              [Project ▼]  [Network ▼]  👤  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────────────────────────────────────────┐ │
│  │ Navigation   │  │                                                   │ │
│  │              │  │  Transaction Simulator                           │ │
│  │ 📊 Simulate  │  │  ─────────────────────────────────────────────── │ │
│  │ 🐛 Debug     │  │                                                   │ │
│  │ ✓  Prover    │  │  Module:    [swap::router                    ▼]  │ │
│  │ ⚡ Gas       │  │  Function:  [swap_exact_input                ▼]  │ │
│  │ 📁 Projects  │  │                                                   │ │
│  │ ⚙️  Settings  │  │  Arguments:                                      │ │
│  │              │  │  ┌─────────────────────────────────────────────┐ │ │
│  │              │  │  │ amount_in: 1000000                          │ │ │
│  │              │  │  │ min_out:   900000                           │ │ │
│  │              │  │  │ path:      ["USDC", "MOVE"]                 │ │ │
│  │              │  │  └─────────────────────────────────────────────┘ │ │
│  │              │  │                                                   │ │
│  │              │  │  Sender: [0x1234...abcd                       ]  │ │
│  │              │  │                                                   │ │
│  │              │  │  [      🚀 Simulate Transaction      ]            │ │
│  │              │  │                                                   │ │
│  └──────────────┘  └──────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Simulation Results                                      ✅ Success │ │
│  │  ──────────────────────────────────────────────────────────────── │ │
│  │                                                                     │ │
│  │  Gas Used: 12,450 / 100,000                          [████░░] 12%  │ │
│  │                                                                     │ │
│  │  ┌─ State Changes ──────────────────────────────────────────────┐ │ │
│  │  │                                                               │ │ │
│  │  │  0x1234::account::Balance<USDC>                              │ │ │
│  │  │  - before: 5,000,000                                         │ │ │
│  │  │  + after:  4,000,000  (-1,000,000)                          │ │ │
│  │  │                                                               │ │ │
│  │  │  0x1234::account::Balance<MOVE>                              │ │ │
│  │  │  - before: 100,000                                           │ │ │
│  │  │  + after:  1,050,000  (+950,000)                            │ │ │
│  │  │                                                               │ │ │
│  │  └───────────────────────────────────────────────────────────────┘ │ │
│  │                                                                     │ │
│  │  ┌─ Events (2) ─────────────────────────────────────────────────┐ │ │
│  │  │  SwapEvent { amount_in: 1000000, amount_out: 950000 }        │ │ │
│  │  │  TransferEvent { from: 0x1234, to: pool, amount: 1000000 }   │ │ │
│  │  └───────────────────────────────────────────────────────────────┘ │ │
│  │                                                                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Debugger View

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🐛 Debugger                                              Step 23/156   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─ Source Code ───────────────────────┐ ┌─ Call Stack ───────────────┐ │
│  │                                      │ │                            │ │
│  │  18 │  public fun swap(              │ │  ▶ swap::router::swap     │ │
│  │  19 │      amount_in: u64,           │ │    └─ pool::execute_swap  │ │
│  │  20 │      min_out: u64              │ │       └─ math::calc_out   │ │
│  │  21 │  ): u64 {                      │ │                            │ │
│  │  22 │      let pool = get_pool();    │ └────────────────────────────┘ │
│  │➤ 23 │      let out = calc_output(    │                              │
│  │  24 │          amount_in,            │ ┌─ Local Variables ─────────┐ │
│  │  25 │          pool.reserve_a,       │ │                            │ │
│  │  26 │          pool.reserve_b        │ │  amount_in: 1000000       │ │
│  │  27 │      );                        │ │  min_out: 900000          │ │
│  │  28 │      assert!(out >= min_out);  │ │  pool: Pool {             │ │
│  │                                      │ │    reserve_a: 10000000    │ │
│  └──────────────────────────────────────┘ │    reserve_b: 9500000     │ │
│                                           │  }                         │ │
│  ┌─ Controls ───────────────────────────┐ │  out: (not yet assigned)  │ │
│  │                                       │ │                            │ │
│  │  [⏮] [◀ Step] [Step ▶] [⏭] [▶ Run]  │ └────────────────────────────┘ │
│  │                                       │                              │
│  │  Breakpoints: line 28 ✓              │ ┌─ Gas Usage ───────────────┐ │
│  │                                       │ │  This step: +45           │ │
│  └───────────────────────────────────────┘ │  Total: 8,230             │ │
│                                             └────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Move Prover View

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ✓ Move Prover                                      Last run: 2 min ago │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Project: my-defi-app          Modules: 5          Duration: 12.4s      │
│                                                                          │
│  ┌─ Verification Results ───────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │  ✅ swap::router           4/4 specs passed                      │   │
│  │  ✅ swap::pool             6/6 specs passed                      │   │
│  │  ❌ swap::math             2/3 specs passed                      │   │
│  │  ✅ utils::safe_math       8/8 specs passed                      │   │
│  │  ✅ utils::events          2/2 specs passed                      │   │
│  │                                                                   │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─ Failed Spec: swap::math::calc_output_spec ──────────────────────┐   │
│  │                                                                   │   │
│  │  Specification:                                                  │   │
│  │  ┌─────────────────────────────────────────────────────────────┐ │   │
│  │  │  spec calc_output {                                         │ │   │
│  │  │      ensures result <= reserve_b;  // ❌ VIOLATED           │ │   │
│  │  │      ensures result > 0;           // ✅ passed              │ │   │
│  │  │  }                                                          │ │   │
│  │  └─────────────────────────────────────────────────────────────┘ │   │
│  │                                                                   │   │
│  │  Counterexample found:                                           │   │
│  │  ┌─────────────────────────────────────────────────────────────┐ │   │
│  │  │  amount_in = 18446744073709551615  (u64::MAX)               │ │   │
│  │  │  reserve_a = 1                                              │ │   │
│  │  │  reserve_b = 1000000                                        │ │   │
│  │  │  result = 1000001  (overflows reserve_b!)                   │ │   │
│  │  └─────────────────────────────────────────────────────────────┘ │   │
│  │                                                                   │   │
│  │  💡 Suggestion: Add overflow check or cap input amount          │   │
│  │                                                                   │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  [      🔄 Re-run Prover      ]    [      📥 Export Report      ]       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Revenue Model

### Pricing Tiers

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0/mo | 100 simulations/mo, 10 prover runs, testnet only |
| **Pro** | $49/mo | 5,000 simulations, unlimited prover, mainnet, 1 project |
| **Team** | $199/mo | Unlimited, 5 team members, CI/CD, 10 projects |
| **Enterprise** | Custom | Self-hosted, SLA, dedicated support |

### Revenue Projections

| Milestone | Users | Paid Users | MRR |
|-----------|-------|------------|-----|
| Month 3 | 500 | 25 (5%) | $1,225 |
| Month 6 | 2,000 | 150 (7.5%) | $7,350 |
| Month 12 | 10,000 | 1,000 (10%) | $49,000 |

---

## Technical Requirements

### Backend Stack
- **Language:** Rust (performance critical) + Node.js (API)
- **Simulation:** Fork of Movement node or Aptos Move VM
- **Prover:** Move Prover CLI wrapper
- **Database:** PostgreSQL (projects, history)
- **Cache:** Redis (simulation results)
- **Queue:** BullMQ (prover jobs)

### Frontend Stack
- **Framework:** Next.js 14
- **Code Editor:** Monaco Editor
- **Charts:** Recharts / D3
- **State:** React Query + Zustand
- **Styling:** Tailwind CSS

### Infrastructure
- **Hosting:** Vercel (frontend), Railway/Fly.io (backend)
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry, Grafana

---

## Success Metrics

### Hackathon Demo

| Metric | Target |
|--------|--------|
| Working simulation | ✅ |
| State changes displayed | ✅ |
| Gas breakdown shown | ✅ |
| Web UI functional | ✅ |

### Post-Launch

| Metric | Target (Month 1) | Target (Month 6) |
|--------|------------------|------------------|
| Registered users | 200 | 2,000 |
| Simulations run | 5,000 | 100,000 |
| Prover runs | 500 | 10,000 |
| GitHub Action installs | 20 | 500 |
| Paid conversions | 5% | 10% |

---

## Development Timeline

### Week 1: Simulation Engine
- [ ] Movement RPC integration
- [ ] Basic transaction simulation
- [ ] State diff calculation
- [ ] API endpoints

### Week 2: Web Dashboard
- [ ] Next.js app setup
- [ ] Simulation UI
- [ ] Results display
- [ ] Gas visualization

### Week 3: Debugging & Polish
- [ ] Execution trace parsing
- [ ] Basic step-through UI
- [ ] Move Prover integration (stretch)
- [ ] Documentation

### Week 4: Demo Prep
- [ ] Bug fixes
- [ ] Demo video
- [ ] Landing page
- [ ] Submission

---

## Competitive Positioning

### vs Tenderly (Ethereum)
- Same features but for Move/Movement
- First mover in Move ecosystem
- Prover integration (Tenderly doesn't have)

### vs Remix (Ethereum)
- More advanced simulation
- CI/CD integration
- Team collaboration

### vs Movement CLI
- Visual instead of CLI
- Easier to use
- Better debugging

---

## Appendix

### API Design

```typescript
// POST /api/simulate
{
  network: "testnet",
  sender: "0x1234...",
  payload: {
    function: "0xdex::router::swap",
    type_arguments: [],
    arguments: ["1000000", "900000"]
  }
}

// Response
{
  success: true,
  gas_used: 12450,
  changes: [...],
  events: [...],
  trace: [...]
}

// POST /api/prove
{
  project_id: "proj_abc123",
  modules: ["swap::router", "swap::pool"],
  timeout: 300
}

// Response (async via webhook)
{
  status: "completed",
  results: [...],
  duration_ms: 12400
}
```

### Team Requirements
- 1 Rust developer (simulation engine)
- 1 Full-stack developer (API + frontend)
- 1 DevOps (CI/CD integration)
