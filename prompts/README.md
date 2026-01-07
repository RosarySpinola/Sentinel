# Sentinel Production Implementation Prompts

These prompts complete the app from MVP (70% done) to full production SaaS (100%).

---

## Current Completion Status

| Category | Before | After All Prompts |
|----------|--------|-------------------|
| **MVP Features** | ✅ 100% | ✅ 100% |
| **P1 Features** | ✅ 100% | ✅ 100% |
| **P2 Features** | ❌ 0% | ✅ 100% |
| **Infrastructure** | ❌ 0% | ✅ 100% |
| **Overall** | ~70% | 100% |

---

## What's Already Complete (MVP + P1)

- ✅ Transaction Simulator (API + Frontend)
- ✅ Execution Trace & Debugger (API + Frontend)
- ✅ Gas Profiler (API + Frontend)
- ✅ Move Prover Integration (API + Frontend)
- ✅ GitHub Action for CI/CD
- ✅ Wallet Integration
- ✅ E2E Tests

---

## Execution Order

| # | Prompt | Description | Priority | Dependencies |
|---|--------|-------------|----------|--------------|
| 1 | [Database Setup](./1.md) | PostgreSQL + Prisma schema | HIGHEST | None |
| 2 | [Authentication](./2.md) | Clerk user auth | HIGHEST | Prompt 1 |
| 3 | [Projects](./3.md) | Project management | High | Prompts 1, 2 |
| 4 | [History](./4.md) | Transaction history | High | Prompts 1-3 |
| 5 | [Teams](./5.md) | Team workspaces | Medium | Prompts 1-3 |
| 6 | [API Keys](./6.md) | API key management | High | Prompts 1, 2 |
| 7 | [Caching](./7.md) | Redis caching layer | Medium | Prompts 1, 6 |
| 8 | [Deployment](./8.md) | Production deployment | High | Prompts 1-7 |

---

## Parallel Execution Groups

You can run these prompt groups in parallel to speed up development:

### Phase 1: Foundation (Sequential)
```
Prompt 1 (Database) → Prompt 2 (Auth)
```
Must be done first, in order.

### Phase 2: Features (Parallel after Phase 1)
```
┌─ Prompt 3 (Projects) ─┐
│                       ├→ Prompt 4 (History)
├─ Prompt 5 (Teams) ────┘
│
└─ Prompt 6 (API Keys) → Prompt 7 (Caching)
```

### Phase 3: Deployment (After all above)
```
Prompt 8 (Deployment)
```

---

## Running Prompts

In a fresh Claude Code session:

```
/run-prompt 1
```

The `/run-prompt` command will:
1. Read the prompt file
2. Create todos from requirements
3. Execute each requirement using tools (Read, Write, Edit, Bash)
4. Run verification commands
5. Delete prompt file if verification passes
6. Report what was accomplished

After completion, report back here:
```
completed prompt 1
```

---

## Pre-Prompt Checklist

Before running any prompt, ensure:

- [ ] Read `docs/issues/` for relevant domain (ui/, move/, tooling/)
- [ ] Load appropriate skill (`ui-dev`, `api-dev`, etc.)
- [ ] Have required services running (Docker, etc.)
- [ ] Previous dependency prompts completed

---

## Issue Documentation

Each prompt includes instructions to document issues encountered.

**When to document:**
- Problem caused debugging back-and-forth
- Solution wasn't obvious
- Issue likely to recur

**Where to document:**
- `docs/issues/ui/README.md` - Frontend issues
- `docs/issues/move/README.md` - Move/SDK issues
- `docs/issues/movement/README.md` - Network issues
- `docs/issues/tooling/README.md` - Infrastructure issues

---

## Success Criteria (Full App)

When all prompts are complete:

### Authentication & Users
- [ ] Users can sign up/login with Clerk
- [ ] User data synced to database
- [ ] Protected routes require auth

### Projects & Teams
- [ ] Can create/edit/delete projects
- [ ] Projects organize simulations
- [ ] Can create teams and invite members
- [ ] Team projects shared with all members

### History & Persistence
- [ ] All simulations saved to database
- [ ] All prover runs saved to database
- [ ] Can browse history by project
- [ ] Can re-run simulations from history

### API Access
- [ ] Can generate API keys
- [ ] API endpoints require valid key
- [ ] Rate limiting enforced
- [ ] Keys can be revoked

### Performance
- [ ] Simulation results cached
- [ ] Module ABIs cached
- [ ] Cache hit <50ms response

### Production
- [ ] Frontend on Vercel
- [ ] API on Railway
- [ ] Database on Railway/Supabase
- [ ] Redis on Upstash
- [ ] CI/CD pipeline working
- [ ] Error monitoring with Sentry

---

## Estimated Effort

| Prompt | Estimated Work |
|--------|----------------|
| 1. Database | Backend setup |
| 2. Authentication | Frontend + Backend |
| 3. Projects | Frontend heavy |
| 4. History | Frontend + Backend |
| 5. Teams | Frontend + Backend |
| 6. API Keys | Backend heavy |
| 7. Caching | Backend only |
| 8. Deployment | DevOps |

---

## After All Prompts

1. **Update PRD.md** - Mark all features as complete
2. **Update CLAUDE.md** - Add production deployment info
3. **Create demo video** - Record walkthrough
4. **Write blog post** - Announce launch

---

## Additional Completed Work

The following items were completed outside of the numbered prompts:

| Item | Status | Location |
|------|--------|----------|
| Sample Move contracts | ✅ | `move/sources/` |
| Move tests | ✅ | `move/tests/` |
| GitHub Action for users | ✅ | `action/` |
| Deployment documentation | ✅ | `docs/DEPLOYMENT.md` |
| Manual setup guide | ✅ | `MANUAL_STEPS.md` |
| Project README | ✅ | `README.md` |

---

## Questions?

If a prompt is unclear or has issues, document in the relevant `docs/issues/` folder and ask for clarification before proceeding.
