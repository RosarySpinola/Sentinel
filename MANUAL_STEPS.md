# Manual Steps Required for Production Deployment

This document lists all the manual steps YOU need to complete to deploy Sentinel to production.

---

## What's Already Done (Automated)

- [x] Move contracts created with specs (`move/sources/`)
- [x] GitHub Action for users created (`action/`)
- [x] CI/CD workflows configured (`.github/workflows/`)
- [x] Database migrations written (`api/migrations/`)
- [x] Deployment configs ready (`api/railway.toml`, workflows)
- [x] Deployment documentation (`docs/DEPLOYMENT.md`)

---

## What YOU Need to Do

### 1. Create Service Accounts (10 minutes)

| Service | URL | What to Get |
|---------|-----|-------------|
| **Clerk** | https://clerk.com | Sign up → Create app → Get API keys |
| **Railway** | https://railway.app | Sign up with GitHub |
| **Upstash** | https://upstash.com | Sign up → Create Redis database |
| **Vercel** | https://vercel.com | Sign up with GitHub |

---

### 2. Set Up Clerk Authentication (5 minutes)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create new application → Name it "Sentinel"
3. Enable sign-in methods (Email, Google, GitHub - your choice)
4. Copy these keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_`)
   - `CLERK_SECRET_KEY` (starts with `sk_`)

**Save these somewhere safe - you'll need them for Vercel.**

---

### 3. Set Up Database on Railway (10 minutes)

1. Go to [Railway](https://railway.app)
2. Create new project
3. Click "Add Service" → "Database" → "PostgreSQL"
4. Wait for it to provision
5. Click on the PostgreSQL service → "Variables" tab
6. Copy `DATABASE_URL` (starts with `postgresql://`)

**Run migrations:**
```bash
# Install sqlx-cli if you haven't
cargo install sqlx-cli --no-default-features --features postgres

# Set the database URL
export DATABASE_URL="your-copied-url"

# Run migrations
cd api
sqlx migrate run
```

---

### 4. Set Up Redis on Upstash (5 minutes)

1. Go to [Upstash Console](https://console.upstash.com)
2. Create new Redis database
3. Choose region closest to Railway (e.g., `us-east-1`)
4. Copy the `UPSTASH_REDIS_REST_URL` or connection string

**Note:** Redis is optional. The API works without it (just no caching).

---

### 5. Deploy API to Railway (10 minutes)

1. In your Railway project, click "Add Service" → "GitHub Repo"
2. Select your Sentinel repository
3. Configure:
   - **Root Directory:** `api`
   - **Build Command:** (Railway auto-detects Rust)
   - **Start Command:** (uses Dockerfile)

4. Add environment variables in Railway:

```
DATABASE_URL=postgresql://... (from step 3)
REDIS_URL=redis://... (from step 4, optional)
PORT=8080
RUST_LOG=info
CORS_ORIGINS=https://your-vercel-domain.vercel.app
```

5. Deploy and note your API URL (e.g., `https://sentinel-api-xxx.up.railway.app`)

**Test it:**
```bash
curl https://your-api-url/health
```

---

### 6. Deploy Frontend to Vercel (10 minutes)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js (auto-detected)

5. Add environment variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_... (from step 2)
CLERK_SECRET_KEY=sk_... (from step 2)
NEXT_PUBLIC_API_URL=https://your-railway-api-url (from step 5)
```

6. Deploy!

---

### 7. Configure Clerk Webhook (5 minutes)

1. Go back to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to "Webhooks"
3. Add new endpoint:
   - **URL:** `https://your-vercel-domain.vercel.app/api/webhooks/clerk`
   - **Events:** `user.created`, `user.updated`, `user.deleted`
4. Copy the signing secret
5. Add to Vercel environment variables:
   ```
   CLERK_WEBHOOK_SECRET=whsec_...
   ```
6. Redeploy Vercel

---

### 8. Update CORS on Railway (2 minutes)

Now that you have your Vercel URL:

1. Go to Railway → Your API service → Variables
2. Update `CORS_ORIGINS` with your actual Vercel domain:
   ```
   CORS_ORIGINS=https://sentinel-xxx.vercel.app
   ```
3. Railway will auto-redeploy

---

### 9. Set Up GitHub Secrets for CI/CD (5 minutes)

Go to your GitHub repo → Settings → Secrets and variables → Actions

Add these secrets:

| Secret | How to Get It |
|--------|---------------|
| `VERCEL_TOKEN` | Vercel → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Vercel → Settings → General → Team ID |
| `VERCEL_PROJECT_ID` | Vercel → Project → Settings → General → Project ID |
| `RAILWAY_TOKEN` | Railway → Account → Tokens → Create |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | From Clerk dashboard |

---

### 10. Test Everything (5 minutes)

1. **Frontend loads:** Visit your Vercel URL
2. **Sign up works:** Create an account
3. **API responds:** Navigate to Simulator
4. **Simulation runs:** Try simulating a transaction
5. **CI/CD works:** Push a commit and watch the workflows

---

## Optional: Custom Domain

### For Frontend (Vercel)
1. Vercel → Project → Settings → Domains
2. Add your domain (e.g., `sentinel.dev`)
3. Configure DNS as instructed

### For API (Railway)
1. Railway → Service → Settings → Domains
2. Add custom domain (e.g., `api.sentinel.dev`)
3. Configure DNS CNAME

---

## Optional: Error Monitoring (Sentry)

1. Go to [sentry.io](https://sentry.io)
2. Create project for Next.js → Get DSN
3. Create project for Rust → Get DSN
4. Add to environment variables:
   - Vercel: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`
   - Railway: `SENTRY_DSN`

---

## Summary Checklist

```
[ ] Clerk account + app created
[ ] Railway account + PostgreSQL provisioned
[ ] Database migrations run
[ ] Upstash Redis created (optional)
[ ] API deployed to Railway
[ ] Frontend deployed to Vercel
[ ] Clerk webhook configured
[ ] CORS updated with Vercel domain
[ ] GitHub secrets configured
[ ] Everything tested and working
```

---

## Estimated Time: 45-60 minutes

Most of this is waiting for deploys and copying/pasting URLs. The actual work is straightforward.

---

## Need Help?

- **Clerk issues:** https://clerk.com/docs
- **Railway issues:** https://docs.railway.app
- **Vercel issues:** https://vercel.com/docs
- **Upstash issues:** https://upstash.com/docs

Or open an issue on the repository.
