# Sanitization Guide for Evaluation Mode

This document explains how to prepare the debug-capability-suite for **fair benchmarking** by removing content that leaks answers to agents.

---

## The Problem

Many projects contain:
- `BUG:` comments in code that describe the exact issue
- README sections titled "The Bug" that list root causes
- Tests with comments explaining what's wrong
- "What Makes This Realistic" bullets that spell out mismatches

This allows an agent to `grep "BUG:"` → patch mechanically → "pass" without real debugging.

---

## Two-Mode Strategy

### Training Mode (Current State)
- Rich hints help humans learn debugging patterns
- `BUG:` comments explain issues for educational purposes
- README sections guide understanding

### Evaluation Mode (For Benchmarking)
- Strip all answer-leaking content
- Keep only: symptoms, repro steps, expected success state
- Move explanations to `INSTRUCTOR_NOTES.md` (excluded from agent context)

---

## What to Remove/Move

### ❌ Remove from Code Files

| Pattern | Example | Action |
|---------|---------|--------|
| `// BUG:` comments | `// BUG: Missing await here` | Delete line |
| `# BUG:` comments | `# BUG: Wrong comparison operator` | Delete line |
| `/* BUG: */` comments | `/* BUG: Returns wrong type */` | Delete block |
| Inline explanations | `// Frontend expects X but this returns Y` | Delete line |
| TODO-style hints | `// TODO: This should be !== not !=` | Delete line |

### ❌ Remove from READMEs

| Section | Replace With |
|---------|--------------|
| "The Bug" (listing causes) | "The Bug" (symptoms only) |
| "Bug Categories" lists | Remove entirely |
| "What Makes This Realistic" (with specifics) | Generic version or remove |
| "Key Files to Examine" | Remove |
| "Error Summary" tables | Remove (keep just the error output) |
| "Correct Patterns (Reference)" | Move to INSTRUCTOR_NOTES.md |

### ✅ Keep in READMEs

- Project description ("What This Does When Fixed")
- Symptoms (error messages, observed behavior)
- Expected success state
- How to verify (commands to run)
- Difficulty rating
- File structure (folder names only, no bug hints)

---

## INSTRUCTOR_NOTES.md Template

Create this file in each project for human reviewers / solution verification:

```markdown
# Instructor Notes: [Project Name]

## Bugs Present

1. [File:Line] - Description of bug
2. [File:Line] - Description of bug

## Root Causes

- [Explanation of why each bug occurs]

## Fix Strategy

- [How to fix each bug]

## Verification

- [What to check after fixing]

## Common Agent Mistakes

- [Patterns that indicate shallow fixing vs real understanding]
```

---

## Sanitization Checklist

For each project, verify:

- [ ] No `BUG:` or `TODO:` comments remain in code
- [ ] No inline "expects X but gets Y" comments
- [ ] README has no "The Bug" section listing causes
- [ ] README has no "Key Files" or "Error Summary" tables
- [ ] README has no "Correct Patterns" tutorials
- [ ] Tests have no comments explaining the bug
- [ ] `INSTRUCTOR_NOTES.md` exists with the moved content

---

## Grep Commands for Auditing

Run these to find remaining leakage:

```bash
# Find BUG comments in code
grep -rn "BUG:" --include="*.py" --include="*.js" --include="*.ts" --include="*.java" --include="*.go" --include="*.cs" --include="*.cpp" --include="*.h"

# Find common explanation patterns
grep -rni "expects\|should be\|wrong\|incorrect\|mismatch\|missing" --include="*.py" --include="*.js" --include="*.ts"

# Find README sections that leak
grep -rn "## The Bug\|## Bug Categories\|## Key Files\|## Correct Patterns" --include="README.md"
```

---

## Automated Sanitization

Use `scripts/sanitize.ps1` to create a clean `eval/` copy:

```powershell
.\scripts\sanitize.ps1 -SourceDir . -OutputDir ./eval
```

This will:
1. Copy all project files
2. Strip `BUG:` comments from code
3. Rewrite READMEs to eval-mode format
4. Exclude `INSTRUCTOR_NOTES.md` from output
