# Sentinel GitHub Action

Run transaction simulations and Move Prover verification on your Move smart contracts as part of your CI/CD pipeline.

## Usage

Add this to your workflow file (e.g., `.github/workflows/verify.yml`):

```yaml
name: Sentinel Verify

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
        uses: sentinel-move/action@v1
        with:
          project_path: ./contracts
          run_prover: true
          run_simulation: true
          gas_threshold: 100000

          # Optional: Add API key for advanced features
          # api_key: ${{ secrets.SENTINEL_API_KEY }}

          # Optional: Define simulation scenarios
          scenarios: |
            - name: "Basic swap"
              function: "dex::swap"
              args: ["100", "0"]
              expect_success: true
            - name: "Insufficient balance"
              function: "dex::swap"
              args: ["1000000000", "0"]
              expect_error: "E_INSUFFICIENT_BALANCE"
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `api_key` | Sentinel API key for advanced features | No | - |
| `project_path` | Path to Move project directory | No | `.` |
| `network` | Network to simulate against | No | `testnet` |
| `run_prover` | Run Move Prover verification | No | `true` |
| `run_simulation` | Run transaction simulations | No | `true` |
| `gas_threshold` | Fail if gas exceeds this amount | No | `0` (disabled) |
| `scenarios` | YAML list of simulation scenarios | No | - |
| `fail_on_prover_error` | Fail workflow if prover finds issues | No | `true` |

## Outputs

| Output | Description |
|--------|-------------|
| `prover_status` | `passed` or `failed` |
| `simulation_status` | `passed` or `failed` |
| `gas_report` | JSON gas usage report |
| `report_url` | URL to detailed report on Sentinel dashboard |

## Examples

### Basic Prover Check

```yaml
- uses: sentinel-move/action@v1
  with:
    project_path: ./move
    run_prover: true
    run_simulation: false
```

### Full Verification with Simulations

```yaml
- uses: sentinel-move/action@v1
  with:
    api_key: ${{ secrets.SENTINEL_API_KEY }}
    project_path: ./contracts
    network: testnet
    run_prover: true
    run_simulation: true
    gas_threshold: 50000
    scenarios: |
      - name: "Initialize pool"
        function: "pool::initialize"
        args: []
        expect_success: true
      - name: "Add liquidity"
        function: "pool::add_liquidity"
        args: ["1000000", "1000000"]
        expect_success: true
```

### Check Gas Only

```yaml
- uses: sentinel-move/action@v1
  with:
    run_prover: false
    gas_threshold: 100000
    scenarios: |
      - name: "Heavy operation"
        function: "batch::process_all"
        args: []
```

## License

MIT
