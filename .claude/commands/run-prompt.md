---
description: Execute a prompt from the prompts/ directory
argument: <prompt number, e.g., "1" or "1-3">
---

# EXECUTE PROMPT $ARGUMENTS

**THIS IS NOT A DESCRIPTION. YOU MUST ACTUALLY EXECUTE THE PROMPT NOW.**

---

## STEP 1: READ THE PROMPT FILE (DO THIS NOW)

Use the Read tool to read the prompt file:

```
Read file: prompts/$ARGUMENTS.md
```

If the argument is a range like "1-3", read prompts 1, 2, and 3 in order. Process them sequentially.

**YOU MUST USE THE READ TOOL NOW. DO NOT PROCEED WITHOUT READING THE FILE.**

---

## STEP 2: CHECK DEPENDENCIES

If the prompt says "Requires: Prompt N" or has dependencies:
- Check if the required prompt files still exist in prompts/
- If they exist, the dependency is NOT completed - STOP and tell the user
- If they don't exist, the dependency IS completed - proceed

---

## STEP 3: CHECK RELEVANT LEARNINGS

**Check relevant learnings in `docs/issues/`** based on task type:
- Move/contracts → `docs/issues/move/README.md`
- UI/frontend → `docs/issues/ui/README.md`
- Indexer → `docs/issues/indexer/README.md`
- Movement network → `docs/issues/movement/README.md`

```bash
# Example: For Move contract work
cat docs/issues/move/README.md
```

This prevents repeating documented mistakes and saves debugging time.

---

## STEP 4: CREATE A TODO LIST

Use the TodoWrite tool to create a task list based on the prompt's requirements.

**Example:**
```
If prompt says:
- Create file X
- Modify file Y
- Run tests

Create todos:
1. Create file X (from prompt requirements)
2. Modify file Y (from prompt requirements)
3. Run verification tests
```

---

## STEP 5: EXECUTE EACH REQUIREMENT

For EACH requirement in the prompt, you MUST:

1. **Use actual tools** - Read, Write, Edit, Bash
2. **Write real code** - Not placeholder or mock code
3. **Follow existing patterns** - Check similar files first
4. **Mark todos complete** - As you finish each one

**YOU ARE IMPLEMENTING THE PROMPT. NOT DESCRIBING WHAT WOULD HAPPEN.**

---

## STEP 6: RUN VERIFICATION

Execute ALL verification steps from the prompt's "Verification" or "Success Criteria" section.

Common verifications:
- `cargo build` - Check Rust compiles
- `cargo test` - Check tests pass
- `npm run build` - Check frontend builds
- `curl` commands - Test API endpoints

**If verification fails, fix the issue. Do not proceed until it passes.**

---

## STEP 7: DELETE THE PROMPT FILE

Only after ALL verifications pass:

```bash
rm prompts/$ARGUMENTS.md
```

---

## STEP 8: REPORT COMPLETION

After deleting the prompt file, report:

1. **What was accomplished** - Specific features implemented
2. **Files created/modified** - List with line counts
3. **Verification results** - What tests/builds passed
4. **Remaining prompts** - List prompts still in prompts/

---

## FAILURE HANDLING

If you cannot complete the prompt:

1. **STOP immediately** - Do not pretend to complete
2. **Keep the prompt file** - Do NOT delete it
3. **Report what failed** - Be specific about the blocker
4. **Ask for guidance** - What should be done next?

---

## CRITICAL RULES

- **NO MOCK RESPONSES** - Everything must be real execution
- **USE TOOLS** - Read, Write, Edit, Bash for every action
- **REAL CODE ONLY** - No placeholders, no "TODO: implement"
- **VERIFY BEFORE DELETE** - Only delete prompt after verification passes
- **TRACK WITH TODOS** - Use TodoWrite to show progress
