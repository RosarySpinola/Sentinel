---
name: strategy
description: Strategic planning mode for complex features. Generates executable prompts for multi-session implementation.
---

# Strategy Skill - PLANNING MODE ACTIVE

**YOU ARE NOW IN NO-CODE PLANNING MODE.**

You will NOT write implementation code. You will:
1. Analyze the user's goal
2. Break it into executable prompts
3. Write prompt files to `prompts/` directory

---

## IMMEDIATE ACTIONS REQUIRED

### Action 1: Understand Current State

**USE THESE TOOLS NOW:**

1. Read project instructions:
   - `Read file: CLAUDE.md`
   - `Read file: PRD.md`

2. Check existing prompts:
   - `Glob pattern: prompts/*.md`
   - Read any existing prompts

3. Explore relevant code:
   - Use Glob to find related files
   - Read key files to understand current state

---

### Action 2: Analyze the Goal

Break the user's goal into:
- **Independent chunks** that can be done in parallel
- **Dependencies** that must be done in order
- **Verification steps** for each chunk

---

### Action 3: Write Prompt Files

For each chunk, create a prompt file using this EXACT format:

```markdown
# Prompt N: [Title]

**Priority**: [HIGHEST/High/Medium/Low]
**Skill**: [ui-dev/api-dev/move-dev/none]
**Estimated Complexity**: [High/Medium/Low]

---

## Objective

[1-2 sentences: What this prompt accomplishes]

---

## Current State

[What exists now - specific file paths and line counts]

---

## Requirements

### 1. [First Requirement]
[Specific details]

### 2. [Second Requirement]
[Specific details]

---

## Implementation Steps

1. Read [specific file] to understand current pattern
2. Create [specific file] with [specific content]
3. [More specific steps]

---

## Files to Create/Modify

- `path/to/file.ts` - CREATE - [what it does]
- `path/to/other.ts` - MODIFY - [what changes]

---

## Verification

After implementation, run:
```bash
[specific commands]
```

---

## Success Criteria

- [ ] [Specific, testable criterion 1]
- [ ] [Specific, testable criterion 2]
- [ ] [Specific, testable criterion 3]

---

## Dependencies

- **Requires**: [Prompt N or None]
- **Blocks**: [Prompt M or None]
```

---

### Action 4: Update README

After writing prompts, update `prompts/README.md`:

```markdown
# Implementation Prompts

## Execution Order

| # | Title | Priority | Dependencies |
|---|-------|----------|--------------|
| 1 | [Title] | HIGH | None |
| 2 | [Title] | Medium | Prompt 1 |

## Parallel Groups

**Group A**: 1, 3, 5 (independent)
**Group B**: 2, 4 (depend on Group A)

## Current Status

| # | Status |
|---|--------|
| 1 | Pending |
| 2 | Pending |
```

---

## RULES FOR PROMPT WRITING

### DO:
- **Be specific** - File paths, line numbers, exact code patterns
- **Include verification** - Commands to run, expected output
- **List dependencies** - What must be done first
- **Keep prompts focused** - One coherent feature per prompt

### DO NOT:
- **Write vague requirements** - "Implement the feature"
- **Skip verification** - "It should work"
- **Create circular deps** - A needs B, B needs A
- **Overload prompts** - Too many unrelated tasks

---

## REPORTING WHEN USER SAYS "completed prompt N"

When user reports completion:

1. **Check** if prompt file was deleted
2. **Update** README.md status table
3. **Report** which prompts are now unblocked
4. **Suggest** next prompt to run

---

## CRITICAL REMINDERS

- **NO CODE** - Only prompt files and README
- **USE TOOLS** - Read, Write, Glob for all actions
- **BE SPECIFIC** - Every prompt must be self-contained
- **VERIFY DEPS** - Check dependency graph has no cycles
