# Sentinel Deployment Guide

This guide covers deploying Sentinel to production with:
- Frontend on **Vercel**
- API on **Railway**
- PostgreSQL on **Railway**
- Redis on **Upstash**

---

## Prerequisites

### Required Accounts

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| [Vercel](https://vercel.com) | Frontend hosting | Yes |
| [Railway](https://railway.app) | API hosting + PostgreSQL | $5 credit |
| [Upstash](https://upstash.com) | Redis cache | 10K commands/day |
| [Clerk](https://clerk.com) | Authentication | 10K MAU |
| GitHub | Source control + CI/CD | Unlimited |

### Required Tools

```bash
# Vercel CLI
npm i -g vercel

# Railway CLI
npm i -g @railway/cli

# sqlx CLI (for migrations)
cargo install sqlx-cli --no-default-features --features postgres
```

---

## Step 1: Set Up Clerk Authentication

1. Create a [Clerk](https://clerk.com) account
2. Create a new application
3. Note your keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (pk_live_xxx)
   - `CLERK_SECRET_KEY` (sk_live_xxx)
4. Configure webhook (optional):
   - URL: `https://your-domain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.deleted`
   - Note `CLERK_WEBHOOK_SECRET`

---

## Step 2: Set Up Database (Railway)

1. Create a Railway project
2. Add PostgreSQL plugin
3. Copy the `DATABASE_URL` from connection settings
4. Run migrations:

```bash
export DATABASE_URL="postgres://..."
cd api
sqlx migrate run
```

---

## Step 3: Set Up Redis (Upstash)

1. Create an [Upstash](https://upstash.com) account
2. Create a new Redis database
3. Copy the `REDIS_URL` (redis://default:xxx@region.upstash.io:6379)

---

## Step 4: Deploy API (Railway)

### Via GitHub (Recommended)

1. Connect your GitHub repo to Railway
2. Set root directory to `api`
3. Add environment variables:

```
DATABASE_URL=postgres://...
REDIS_URL=redis://...
RUST_LOG=info
PORT=8080
CORS_ORIGINS=https://sentinel.dev
```

### Via CLI

```bash
cd api
railway login
railway link
railway up
```

### Verify Deployment

```bash
curl https://your-api.railway.app/health
# Should return: {"status":"healthy","version":"0.1.0",...}
```

---

## Step 5: Deploy Frontend (Vercel)

### Via GitHub (Recommended)

1. Import your GitHub repo to Vercel
2. Set root directory to `frontend`
3. Add environment variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```

### Via CLI

```bash
cd frontend
vercel login
vercel --prod
```

---

## Step 6: Configure GitHub Actions

Add these secrets to your GitHub repository:

### Required Secrets

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token (Settings → Tokens) |
| `VERCEL_ORG_ID` | Vercel org ID (Settings → General) |
| `VERCEL_PROJECT_ID` | Vercel project ID (Project Settings) |
| `RAILWAY_TOKEN` | Railway API token (Account Settings) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key |

---

## Environment Variables Reference

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk public key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | No | Webhook signing secret |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL |

### API (Railway)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | No | Redis connection (caching disabled if missing) |
| `RUST_LOG` | No | Log level (default: info) |
| `PORT` | No | Server port (default: 8080) |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins |

---

## Domain Configuration

### Custom Domain on Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `sentinel.dev`)
3. Configure DNS:
   - A record: `76.76.21.21`
   - CNAME for www: `cname.vercel-dns.com`

### Custom Domain on Railway

1. Go to Service → Settings → Domains
2. Add custom domain (e.g., `api.sentinel.dev`)
3. Configure DNS CNAME to Railway domain

---

## SSL/TLS

Both Vercel and Railway automatically provision SSL certificates. No manual configuration needed.

---

## Monitoring & Observability

### Health Checks

- **Liveness**: `GET /livez` - Basic alive check
- **Readiness**: `GET /readyz` - Checks database connection
- **Full Health**: `GET /health` - All dependencies status

### Logs

**Vercel**: Project → Deployments → Functions tab

**Railway**: Service → Logs tab

### Metrics

Railway provides built-in metrics:
- CPU/Memory usage
- Request count
- Response times

---

## Rollback Procedures

### Frontend (Vercel)

```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback
```

### API (Railway)

1. Go to Deployments tab
2. Click on previous deployment
3. Click "Rollback to this deployment"

---

## Database Backups

Railway automatically backs up PostgreSQL databases. To create manual backup:

```bash
pg_dump $DATABASE_URL > backup.sql
```

To restore:

```bash
psql $DATABASE_URL < backup.sql
```

---

## Troubleshooting

### API not starting

1. Check logs: Railway → Service → Logs
2. Verify DATABASE_URL is correct
3. Ensure migrations have run

### CORS errors

1. Verify `CORS_ORIGINS` includes your frontend domain
2. Include both with and without `www`

### Database connection issues

1. Check Railway PostgreSQL is running
2. Verify DATABASE_URL format
3. Check connection limits (free tier: 5 connections)

### Redis connection issues

Redis is optional. If unavailable:
- API continues to work
- Caching is disabled
- Check `REDIS_URL` format

---

## Cost Estimates

| Service | Free Tier | Production |
|---------|-----------|------------|
| Vercel | Unlimited (hobby) | $20/month (pro) |
| Railway | $5 credit | ~$10-20/month |
| Upstash | 10K/day | $0.2/100K commands |
| Clerk | 10K MAU | $25/month (25K MAU) |

**Estimated monthly cost**: $35-65/month for small-medium usage

---

## Quick Deploy Checklist

```
[ ] 1. Create Clerk app → get CLERK keys
[ ] 2. Create Railway project → add PostgreSQL → get DATABASE_URL
[ ] 3. Run migrations: cd api && sqlx migrate run
[ ] 4. Create Upstash Redis → get REDIS_URL
[ ] 5. Deploy API to Railway with env vars
[ ] 6. Deploy Frontend to Vercel with env vars
[ ] 7. Configure Clerk webhook URL
[ ] 8. Add GitHub secrets for CI/CD
[ ] 9. Test: sign up, run simulation, check API health
```
