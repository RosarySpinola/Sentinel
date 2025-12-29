---
description: Strategic planning mode for complex features. Generates executable prompts for multi-session implementation.
argument: <goal - what you want to achieve>
---

# ENTERING STRATEGY MODE

**YOU ARE NOW IN NO-CODE PLANNING MODE.**

Goal: $ARGUMENTS

---

## WHAT YOU MUST DO NOW

### 1. DO NOT write implementation code

You will ONLY:
- Read existing files to understand current state
- Analyze requirements
- Write prompt files to `prompts/`
- Update `prompts/README.md`

### 2. READ project context first

**Use these tools NOW:**

```
Read file: CLAUDE.md
Read file: PRD.md
Glob pattern: prompts/*.md
```

### 3. ANALYZE the goal

Break "$ARGUMENTS" into:
- Independent chunks (can be done in parallel)
- Dependencies (must be done in order)
- Verification steps for each chunk

### 4. WRITE prompt files

For each chunk, use the Write tool to create `prompts/N.md`.

**Required prompt format:**

```markdown
# Prompt N: [Title]

**Priority**: [HIGHEST/High/Medium/Low]
**Skill**: [ui-dev/api-dev/move-dev/none]

---

## Objective

[What this prompt accomplishes]

---

## Current State

[File paths and current status]

---

## Requirements

### 1. [Requirement]
[Details]

---

## Files to Create/Modify

- `path/file.ts` - CREATE - [purpose]
- `path/other.ts` - MODIFY - [what changes]

---

## Verification

```bash
[commands to verify]
```

---

## Success Criteria

- [ ] [Testable criterion]

---

## Dependencies

- **Requires**: [None or Prompt N]
- **Blocks**: [None or Prompt N]
```

### 5. UPDATE prompts/README.md

After writing all prompts, update the README with:
- Execution order table
- Parallel groups
- Current status

---

## RULES

- **NO CODE** - Only prompt files
- **BE SPECIFIC** - File paths, exact requirements
- **INCLUDE VERIFICATION** - Commands to run
- **CHECK DEPENDENCIES** - No circular deps

---

## WHEN USER SAYS "completed prompt N"

1. Check if `prompts/N.md` was deleted
2. Update `prompts/README.md` status
3. Report which prompts are now unblocked
4. Suggest next prompt to run
