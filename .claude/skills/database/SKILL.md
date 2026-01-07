---
name: database
description: Add/remove/edit data or run migrations or make changes in our supabase tables (project)
---

**NEVER: Use Playwright, create manual SQL scripts, or use local DB**

## Project ID: qrsdodlbzjghfxoppcsp

## IMPORTANT: All tables/views/functions MUST be prefixed with `sentinel_`

## Active tables (off-chain data):
- `sentinel_users` - User profiles linked to wallet address
- `sentinel_projects` - User projects for organizing work
- `sentinel_simulations` - Simulation history
- `sentinel_prover_runs` - Move Prover run history
- `sentinel_api_keys` - API keys for CI/CD integration
- `sentinel_teams` - Team workspaces
- `sentinel_team_members` - Team membership

## Auth: Using SERVICE ROLE KEY (no RLS)
- RLS is DISABLED on all sentinel_ tables
- No Supabase auth - wallet-based auth handled by Privy
- User identified by wallet address (primary key)

## Environment Variables (server-side only):
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (NOT anon key)
- NO `NEXT_PUBLIC_*` Supabase variables

## Supabase Client Setup (server-side only):
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

## Schema operations:
```bash
cd frontend

# Create migration
npx supabase migration new description

# Push to remote
npx supabase db push

# Regenerate types (always after schema change)
npx supabase gen types typescript --project-id qrsdodlbzjghfxoppcsp > types/supabase.ts

# Check current schema
npx supabase db dump --remote --schema-only
```

## Check types:
See `frontend/types/supabase.ts` for current schema TypeScript types

Always execute commands directly. Never generate scripts for manual execution.
