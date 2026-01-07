# Sentinel

**Tenderly for Movement** — Transaction simulator, debugger, and formal verification dashboard for Move on Movement Network.

<p align="center">
  <img src="https://img.shields.io/badge/Movement-Network-purple" alt="Movement Network" />
  <img src="https://img.shields.io/badge/Move-Language-blue" alt="Move Language" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## Features

### Transaction Simulator
Preview any transaction before execution. See state changes, events, and gas costs without spending tokens.

### Visual Debugger
Step through execution with call stack visualization, local variable inspection, and gas tracking per instruction.

### Move Prover Dashboard
Run formal verification with visual results. See passing/failing specs and counterexamples for violations.

### Gas Profiler
Analyze gas consumption by operation and function. Get optimization suggestions with estimated savings.

### GitHub Action
Integrate Sentinel into your CI/CD pipeline. Run Move Prover and simulations on every PR.

---

## Quick Start

### Prerequisites

- Node.js 20+
- Rust (latest stable)
- PostgreSQL (for API)

### Development

```bash
# Frontend
cd frontend
npm install
npm run dev
# → http://localhost:3000

# API
cd api
cargo run
# → http://localhost:8080
```

### Demo Move Contracts

The `move/` directory contains sample contracts for testing:

- **Counter** — Simple counter with increment/decrement and Move Prover specs
- **SimpleSwap** — AMM pool with constant product formula and DeFi debugging examples
- **Escrow** — Conditional transfers with time-locked claims/refunds

```bash
cd move
aptos move test
aptos move prove
```

---

## Project Structure

```
Sentinel/
├── frontend/          # Next.js 16 dashboard
├── api/               # Rust API (Axum)
├── move/              # Demo Move contracts
├── action/            # GitHub Action for users
├── docs/              # Documentation
└── .github/workflows/ # CI/CD pipelines
```

---

## Deployment

See [MANUAL_STEPS.md](./MANUAL_STEPS.md) for step-by-step deployment instructions.

**TL;DR:**
1. Create accounts on Clerk, Railway, Upstash, Vercel
2. Set up PostgreSQL + Redis
3. Deploy API to Railway
4. Deploy Frontend to Vercel
5. Configure webhooks and secrets

Full details in [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

---

## GitHub Action Usage

Add Sentinel checks to your Move project CI:

```yaml
# .github/workflows/verify.yml
name: Sentinel Verify

on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: sentinel-move/action@v1
        with:
          project_path: ./contracts
          run_prover: true
          run_simulation: true
          gas_threshold: 100000
```

See [action/README.md](./action/README.md) for full documentation.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS, shadcn/ui |
| API | Rust, Axum, SQLx, Redis |
| Auth | Clerk |
| Database | PostgreSQL |
| Cache | Redis (Upstash) |
| Hosting | Vercel (frontend), Railway (API) |

---

## Movement Network

Sentinel works with all Movement Network environments:

| Network | Chain ID | RPC |
|---------|----------|-----|
| Mainnet | 126 | `https://mainnet.movementnetwork.xyz/v1` |
| Testnet | 27 | `https://testnet.movementnetwork.xyz/v1` |

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `cd frontend && npm test`
5. Submit a PR

Please follow the patterns in [CLAUDE.md](./CLAUDE.md) for code structure.

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

## Links

- [Product Requirements](./PRD.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Manual Setup Steps](./MANUAL_STEPS.md)
- [GitHub Action](./action/README.md)
