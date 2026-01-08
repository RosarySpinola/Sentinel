# Sentinel — Move Transaction Simulator & Debugger

Sentinel is Tenderly for Movement — a transaction simulator, debugger, and formal verification dashboard for the Move ecosystem on Movement Network.

---

## Git Configuration

**Account:** RosarySpinola (Rosary)
```
user.name: RosarySpinola
user.email: mocatproject10@gmail.com
```

### Auto-Commit Rule
**After completing ANY command/prompt, commit and push your changes to GitHub.**

---

## Critical Rules

**NEVER mock or create placeholder code.** If blocked, STOP and explain why.

- No scope creep - only implement what's requested
- No assumptions - ask for clarification
- Follow existing patterns in codebase
- Verify work before completing
- Use conventional commits (`feat:`, `fix:`, `refactor:`)

---

## File Size Limits (CRITICAL)

**HARD LIMIT: 300 lines per file maximum. NO EXCEPTIONS.**

Files over 300 lines (~25000 tokens) CANNOT be read by AI tools and block development.

### Limits by File Type

| File Type | Max Lines | Purpose |
|-----------|-----------|---------|
| `page.tsx` | 150 | Orchestration only |
| `*-tab.tsx` | 250 | Tab components |
| `use-*.ts` | 200 | Hooks with business logic |
| `types.ts` | 100 | Type definitions |
| `constants.ts` | 150 | Addresses, configs |
| `*-service.ts` | 300 | API services |
| `components/shared/*.tsx` | 150 | Reusable UI |
| `*.move` | 300 | Move modules |

### Required Feature Structure

Every feature page MUST be decomposed:

```
app/{feature}/
├── page.tsx              # Orchestration only (< 150 lines)
├── components/
│   ├── simulator-tab.tsx # Tab components (< 250 lines each)
│   ├── debugger-tab.tsx
│   ├── prover-tab.tsx
│   └── shared/
│       ├── module-select.tsx
│       ├── function-select.tsx
│       └── state-diff.tsx
├── hooks/
│   ├── use-simulation.ts     # Business logic (< 200 lines)
│   ├── use-debugger.ts
│   └── use-prover.ts
├── types.ts              # Type definitions (< 100 lines)
└── constants.ts          # Network configs (< 150 lines)
```

### When to Decompose

| Trigger | Action |
|---------|--------|
| File > 300 lines | MUST decompose immediately |
| 3+ useState hooks | Extract to custom hook |
| Multiple tabs/sections | Split into separate components |
| Types inline | Move to types.ts |

**See `code-structure` skill for detailed patterns.**

---

## Documentation Lookup (MANDATORY)

**ALWAYS use Context7 MCP for documentation. NEVER use WebFetch for docs.**

Context7 is the ONLY reliable way to get up-to-date SDK/library documentation.

### How to Use Context7

```
1. First resolve the library ID:
   mcp__context7__resolve-library-id({ libraryName: "aptos-ts-sdk" })

2. Then fetch the docs:
   mcp__context7__get-library-docs({
     context7CompatibleLibraryID: "/aptos-labs/aptos-ts-sdk",
     topic: "simulateTransaction",
     mode: "code"
   })
```

### When to Use Context7

| Scenario | Action |
|----------|--------|
| Need SDK/library docs | **USE CONTEXT7** |
| Checking API usage | **USE CONTEXT7** |
| Finding code examples | **USE CONTEXT7** |
| Learning library patterns | **USE CONTEXT7** |

### Common Libraries in This Project

| Library | Context7 ID |
|---------|-------------|
| Aptos TS SDK | `/aptos-labs/aptos-ts-sdk` |
| Next.js | `/vercel/next.js` |
| React | `/facebook/react` |
| shadcn/ui | `/shadcn-ui/ui` |
| Monaco Editor | `/microsoft/monaco-editor` |
| React Query | `/tanstack/query` |

### DO NOT

- **NEVER use WebFetch for documentation** - It's unreliable
- **NEVER guess SDK usage** - Always verify with Context7 first
- **NEVER assume API signatures** - Look them up via Context7

---

## Skills (LOAD BEFORE STARTING TASKS)

**IMPORTANT: Always load the appropriate skill BEFORE starting any task.**

### How to Use Skills

Load a skill by invoking it at the start of your task:
```
skill: "ui-dev"
skill: "move-dev"
skill: "api-dev"
```

### Required Skills by Task Type

| Task Type | Required Skill | Examples |
|-----------|----------------|----------|
| **Any New Code** | `code-structure` | File size limits, decomposition patterns |
| **UI/Frontend** | `ui-dev` | Components, styling, layouts, shadcn/ui |
| **Move Contracts** | `move-dev` | Writing Move modules, specs, prover |
| **Backend API** | `api-dev` | REST endpoints, simulation engine, Rust |
| **E2E Testing** | `playwright-testing` | Browser automation, test writing |

### Skill Loading Rules

1. **ALWAYS load a skill** when the task matches any skill description
2. **Load BEFORE writing any code** - skills contain critical patterns
3. **Multiple skills** - If task spans multiple domains, load primary first
4. **Don't skip skills** - Even for "simple" tasks, skills ensure consistency

---

## Multi-Prompt System

This project uses a multi-session prompt system for complex features.

### How It Works

1. **`/strategy <goal>`** - Enter planning mode, breaks goal into executable prompts
2. **Prompts written to `prompts/`** - As `1.md`, `2.md`, `3.md`, etc.
3. **Run prompts with `/run-prompt N`** - Execute in fresh sessions
4. **Prompt file deleted on success** - Indicates completion
5. **Check `prompts/README.md`** - For progress and remaining work

### Running Prompts (CRITICAL)

Use the slash command: `/run-prompt 1`

The command will:
1. **Read** `prompts/1.md` using the Read tool
2. **Create todos** from the prompt requirements
3. **Execute** each requirement with actual tools (Read, Write, Edit, Bash)
4. **Run verification** commands from the prompt
5. **Delete** the prompt file ONLY if verification passes
6. **Report** what was accomplished

**IMPORTANT: The `/run-prompt` command MUST use actual tools to implement code. It is NOT just documentation - it triggers real execution.**

### What "run prompt N" Means

When you see "run prompt 1" or `/run-prompt 1`:
- This is a directive to ACTUALLY IMPLEMENT the prompt
- You MUST read the file, write code, run tests
- You MUST NOT just describe what would happen
- You MUST use tools: Read, Write, Edit, Bash, TodoWrite
- You MUST delete the prompt file only after verification passes

---

## Project Structure

```
Sentinel/
├── CLAUDE.md                    # This file
├── PRD.md                       # Product requirements
├── .claude/
│   ├── commands/                # Slash commands
│   └── skills/                  # Skill definitions
│
├── frontend/                    # Next.js dashboard
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── simulator/          # Transaction simulator
│   │   ├── debugger/           # Visual debugger
│   │   ├── prover/             # Move Prover dashboard
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── shared/             # Shared app components
│   ├── lib/
│   │   ├── services/           # API client services
│   │   ├── hooks/              # Shared hooks
│   │   └── utils/              # Utility functions
│   └── constants/              # Network configs, types
│
├── api/                         # Backend API (Rust/Node.js)
│   ├── src/
│   │   ├── simulation/         # Simulation engine
│   │   ├── prover/             # Move Prover wrapper
│   │   └── routes/             # API routes
│   └── Cargo.toml              # Rust dependencies
│
└── move/                        # Move contracts (if any)
    ├── sources/                 # .move files
    ├── tests/                   # Move tests
    └── Move.toml               # Move manifest
```

---

## Movement Network Integration

### Network Configs

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Mainnet | 126 | `https://mainnet.movementnetwork.xyz/v1` |
| Testnet | 27 | `https://testnet.movementnetwork.xyz/v1` |
| Devnet | 12 | `https://devnet.movementnetwork.xyz/v1` |

### Simulation API

Use the Aptos-compatible simulation endpoint:

```typescript
// POST /v1/transactions/simulate
const response = await fetch(`${RPC_URL}/v1/transactions/simulate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sender: address,
    sequence_number: "0",
    max_gas_amount: "100000",
    gas_unit_price: "100",
    expiration_timestamp_secs: String(Math.floor(Date.now() / 1000) + 600),
    payload: {
      type: "entry_function_payload",
      function: `${moduleAddress}::${moduleName}::${functionName}`,
      type_arguments: typeArgs,
      arguments: args
    }
  })
});
```

### Move Prover Integration

```bash
# Run Move Prover on a module
aptos move prove --package-dir ./move

# With specific module
aptos move prove --package-dir ./move --filter module_name

# Get detailed output
aptos move prove --package-dir ./move --verbose
```

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `/strategy <goal>` | Enter planning mode, generate prompts |
| `/debug` | Strategic debugging across frontend and API |
| `/deploy-frontend` | Deploy frontend to Vercel |
| `/deploy-api` | Deploy API to Railway/Fly.io |
| `/move-test` | Run Move tests and prover |
| `/simulate` | Test simulation locally |

---

## Issues & Learnings System

### Before Starting These Tasks, Read Relevant Issues:

| Task Type | Read First |
|-----------|------------|
| UI/Frontend | `../docs/issues/ui/README.md` |
| Move contracts | `../docs/issues/move/README.md` |
| Indexing/GraphQL | `../docs/issues/indexer/README.md` |
| Movement network | `../docs/issues/movement/README.md` |

### When to Document a New Learning

**DOCUMENT if ALL of these are true:**
1. It caused repeated back-and-forth debugging (wasted user's time)
2. It's non-obvious (you wouldn't naturally avoid it)
3. It will happen again in future projects
4. The fix isn't easily searchable in official docs

**DO NOT document:**
- Basic syntax errors or typos
- Standard patterns you already know
- One-off edge cases unlikely to repeat
- Things covered in official documentation

### How to Add a Learning

1. Determine category: `ui/`, `move/`, `indexer/`, or `movement/`
2. Read the existing README.md in that folder
3. Add new issue following the template format (increment ID)
4. Keep it focused: problem → root cause → solution → prevention

---

## DO NOT

- **Create files over 300 lines** - They cannot be read by AI tools
- **Put everything in page.tsx** - Decompose into components, hooks, types
- **Use WebFetch for documentation** - ALWAYS use Context7 MCP
- **Skip loading skills** - Always load appropriate skill first
- **Guess SDK/API usage** - Look it up via Context7 first
- Use hardcoded colors (use theme variables)
- Skip loading and error states in UI
- Put business logic in components (extract to hooks)

## DO

- **Keep files under 300 lines** - Decompose early and often
- **Load `code-structure` skill** - For any new component or feature
- **Use Context7 MCP for ALL documentation**
- **Load skills FIRST** - Before any task
- **Verify SDK patterns via Context7** - Before implementing
- Extract business logic to hooks
- Keep page.tsx as pure orchestration
- Put types in types.ts
- Handle loading/error states
- Use the Movement/Aptos SDK correctly
