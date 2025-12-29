---
description: Deploy API to Railway or Fly.io
argument: <environment: production or staging>
---

# Deploy API

Deploy the backend API (Rust/Node.js) to Railway or Fly.io.

**NO GARBAGE FILES:** Do not create markdown, temp, or documentation files.

## Prerequisites

- Load `api-dev` skill
- Railway/Fly CLI installed
- Project configured on hosting platform
- Environment variables set

## Steps

### 1. Verify Build Locally

For Rust:
```bash
cd api
cargo build --release
```

For Node.js:
```bash
cd api
npm run build
```

**STOP if build fails.** Fix errors before deploying.

### 2. Check Environment Variables

Required variables:
```
MOVEMENT_MAINNET_RPC=https://mainnet.movementnetwork.xyz/v1
MOVEMENT_TESTNET_RPC=https://testnet.movementnetwork.xyz/v1
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

### 3. Deploy to Railway

```bash
cd api

# Login
railway login

# Deploy
railway up

# Check logs
railway logs
```

### 3b. Deploy to Fly.io (Alternative)

```bash
cd api

# Login
fly auth login

# Deploy
fly deploy

# Check logs
fly logs
```

### 4. Verify Deployment

```bash
# Health check
curl https://api.Sentinel.io/health

# Test simulation
curl -X POST https://api.Sentinel.io/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"network":"testnet","sender":"0x1","payload":{"function":"0x1::coin::balance"}}'
```

### 5. Update Frontend API URL

If API URL changed, update frontend env:
```
NEXT_PUBLIC_API_URL=https://api.Sentinel.io
```

## Success Checklist

- [ ] Local build succeeds
- [ ] Deployment completes without errors
- [ ] Health endpoint responds
- [ ] Simulation endpoint works
- [ ] Frontend can call API

## Example Usage

```
/deploy-api production
```

```
/deploy-api staging for testing new prover integration
```

## If This Fails

### Error: "Build failed"
**Fix:** Run build locally and fix compilation errors

### Error: "Connection refused"
**Fix:** Check port binding, firewall rules

### Error: "Database connection failed"
**Fix:** Verify DATABASE_URL, check DB is accessible
