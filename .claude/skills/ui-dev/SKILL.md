---
name: ui-dev
description: Build UI components with dark theme, shadcn/ui, animations, and responsive design for Sentinel dashboard
---

# UI Development Skill - ACTIVE

**USE THIS SKILL FOR ALL FRONTEND/UI WORK.**

---

## BEFORE WRITING ANY CODE - DO THIS FIRST

1. **Check `docs/issues/ui/README.md`** for known pitfalls
2. **Check shadcn/ui via Context7:** Use `/shadcn-ui/ui` library ID to fetch component docs
3. **Verify file size limits:** max 300 lines (page.tsx 150, *-tab.tsx 250, use-*.ts 200, types.ts 100)

---

## FILE SIZE ENFORCEMENT

Before writing ANY component, estimate line count:

- **< 150 lines** → Write as single file
- **150-300 lines** → Consider splitting
- **> 300 lines** → MUST decompose FIRST

### Decomposition Pattern

```
feature/
├── page.tsx          # Orchestration only (< 150)
├── components/
│   ├── main-tab.tsx  # Tab components (< 250 each)
│   ├── other-tab.tsx
│   └── shared/       # Reusable pieces
│       ├── form.tsx
│       └── display.tsx
├── hooks/
│   └── use-feature.ts # Business logic (< 200)
└── types.ts          # Types only (< 100)
```

---

## MANDATORY PATTERNS

### Theme Colors (NEVER hardcode)

```tsx
// WRONG - hardcoded colors
<div className="bg-gray-900 text-white">

// CORRECT - theme variables
<div className="bg-background text-foreground">
```

| Variable | Usage |
|----------|-------|
| `bg-background` | Page background |
| `text-foreground` | Primary text |
| `bg-card` | Card backgrounds |
| `bg-primary` | Primary actions |
| `text-muted-foreground` | Secondary text |
| `bg-destructive` | Error states |

### Loading States (NEVER skip)

```tsx
// WRONG - no loading state
{data && <Component data={data} />}

// CORRECT - all states handled
{isLoading ? (
  <Skeleton className="h-40 w-full" />
) : error ? (
  <div className="text-destructive">{error.message}</div>
) : (
  <Component data={data} />
)}
```

### Responsive Design (mobile-first)

```tsx
// WRONG - desktop only
<div className="flex gap-8">

// CORRECT - responsive
<div className="flex flex-col gap-4 md:flex-row md:gap-8">
```

---

## SENTINEL-SPECIFIC COMPONENTS

### Monaco Editor (Code Input)

```tsx
import Editor from '@monaco-editor/react'

<Editor
  height="400px"
  language="move"
  theme="vs-dark"
  value={code}
  onChange={(value) => setCode(value || '')}
  options={{
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
  }}
/>
```

### State Diff Display

```tsx
<div className="space-y-2">
  <div className="text-red-500 bg-red-500/10 px-2 py-1 rounded font-mono text-sm">
    - {JSON.stringify(before, null, 2)}
  </div>
  <div className="text-green-500 bg-green-500/10 px-2 py-1 rounded font-mono text-sm">
    + {JSON.stringify(after, null, 2)}
  </div>
</div>
```

### Gas Progress Bar

```tsx
import { Progress } from '@/components/ui/progress'

<div className="space-y-1">
  <div className="flex justify-between text-sm">
    <span>Gas Used</span>
    <span>{gasUsed.toLocaleString()} / {maxGas.toLocaleString()}</span>
  </div>
  <Progress value={(gasUsed / maxGas) * 100} />
</div>
```

---

## INSTALLING COMPONENTS

When you need a shadcn component:

```bash
cd frontend && npx shadcn@latest add [component]
```

Common components for Sentinel:
```bash
npx shadcn@latest add button card dialog input select tabs toast progress skeleton badge table
```

---

## QUICK REFERENCE

| Task | Solution |
|------|----------|
| Form input | `shadcn Input` component |
| Dropdown | `shadcn Select` component |
| Modal | `shadcn Dialog` component |
| Code editor | `@monaco-editor/react` |
| Icons | `lucide-react` |
| Hover effect | `transition-all duration-200 hover:bg-muted` |
| Focus ring | `focus:ring-2 focus:ring-primary` |

---

## CHECKLIST BEFORE SUBMITTING

- [ ] File under 300 lines
- [ ] No hardcoded colors (use theme variables)
- [ ] Loading state handled
- [ ] Error state handled
- [ ] Mobile responsive
- [ ] Accessibility (aria labels, keyboard nav)
- [ ] Follows existing patterns in codebase
