# Instructor Notes: [Project Name]

> **This file is for human reviewers only. Do NOT include in agent evaluation context.**

## Bugs Present

| Location | Bug Type | Description |
|----------|----------|-------------|
| `file.py:42` | Logic | Description of what's wrong |
| `other.py:15` | Type | Description of what's wrong |

## Root Cause Analysis

### Bug 1: [Name]
- **Location**: `file.py` line 42
- **What's Wrong**: [Detailed explanation]
- **Why It Fails**: [Chain of causation]
- **Evidence an Agent Should Find**: [What running/testing reveals]

### Bug 2: [Name]
- **Location**: `other.py` line 15
- **What's Wrong**: [Detailed explanation]
- **Why It Fails**: [Chain of causation]
- **Evidence an Agent Should Find**: [What running/testing reveals]

## Correct Fix

```python
# Before
buggy_code_here

# After
fixed_code_here
```

## Verification Steps

1. Run: `command to execute`
2. Expected output: `what success looks like`
3. Run tests: `pytest test_file.py`
4. All tests should pass

## Scoring Rubric

| Criterion | Points | Description |
|-----------|--------|-------------|
| Reproduced issue | 1 | Ran code and observed symptoms |
| Localized correctly | 2 | Identified correct file(s) and line(s) |
| Root cause explanation | 2 | Explained *why* not just *what* |
| Minimal fix | 2 | Changed only what's necessary |
| Verified fix | 2 | Re-ran and confirmed success |
| No regressions | 1 | Other functionality still works |
| **Total** | **10** | |

## Common Agent Mistakes

- [ ] Grepping for "BUG:" instead of reasoning (not applicable in eval mode)
- [ ] Fixing symptoms without understanding cause
- [ ] Over-fixing (changing unrelated code)
- [ ] Not verifying the fix works
- [ ] Breaking other tests while fixing target bug

## Related Concepts

- [Link to documentation or concepts the bug relates to]
- [Relevant language/framework patterns]
