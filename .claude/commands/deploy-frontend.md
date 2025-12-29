---
description: Deploy frontend to Vercel
argument: <environment: production or preview>
---

# Deploy Frontend

Deploy the Next.js dashboard to Vercel.

**NO GARBAGE FILES:** Do not create markdown, temp, or documentation files.

## Prerequisites

- Load `ui-dev` skill
- Vercel CLI installed (`vercel` command)
- Vercel project configured
- All environment variables set

## Steps

### 1. Verify Build Locally

```bash
cd frontend
npm run build
```

**STOP if build fails.** Fix errors before deploying.

### 2. Check Environment Variables

Required variables:
```
NEXT_PUBLIC_MOVEMENT_MAINNET_RPC=https://mainnet.movementnetwork.xyz/v1
NEXT_PUBLIC_MOVEMENT_TESTNET_RPC=https://testnet.movementnetwork.xyz/v1
NEXT_PUBLIC_API_URL=https://api.Sentinel.io
```

### 3. Deploy

```bash
cd frontend

# Preview deployment
vercel

# Production deployment
vercel --prod
```

### 4. Verify Deployment

1. Check deployment URL in terminal output
2. Open URL and verify:
   - Page loads without errors
   - Simulator works
   - Network switching works
   - API calls succeed

### 5. Update DNS (if needed)

If custom domain:
```bash
vercel domains add Sentinel.io
```

## Success Checklist

- [ ] Local build succeeds: `npm run build`
- [ ] Vercel deployment completes
- [ ] Site loads at deployment URL
- [ ] Core features work (simulator, debugger)
- [ ] API calls succeed

## Example Usage

```
/deploy-frontend production
```

```
/deploy-frontend preview for testing new simulator UI
```

## If This Fails

### Error: "Build failed"
**Fix:** Run `npm run build` locally and fix errors

### Error: "Environment variable missing"
**Fix:** Add variables in Vercel dashboard or `.env.production`

### Error: "API calls fail on deployed site"
**Fix:** Check CORS settings, verify API URL env var
