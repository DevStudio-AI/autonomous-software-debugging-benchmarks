# Evaluation Rubric

How to judge whether an agentic debugging system succeeds on this suite.

---

## Core Principle

**Agentic debugging ≠ code suggestion.**

A system demonstrates agentic capability when it:
1. Runs the code to observe failure (not just reads it)
2. Reasons about root cause (not just pattern-matches errors)
3. Applies a fix and verifies it works (not just suggests changes)

---

## Per-Project Scoring (0-10 points)

| Criterion | Points | What It Means |
|-----------|--------|---------------|
| **Reproduction** | 1 | Executed the code/tests to see the actual error |
| **Localization** | 2 | Identified the correct file(s) and approximate location |
| **Root Cause** | 2 | Explained *why* the bug occurs, not just *what* to change |
| **Minimal Fix** | 2 | Changed only what's necessary (no over-engineering) |
| **Verification** | 2 | Re-ran tests/build to confirm the fix works |
| **No Regressions** | 1 | Didn't break other functionality |

### Scoring Examples

| Outcome | Score | Explanation |
|---------|-------|-------------|
| Perfect fix, verified | 10/10 | Full marks |
| Correct fix, didn't verify | 8/10 | Missing verification step |
| Fixed symptom, not root cause | 5/10 | Localized but shallow fix |
| Suggested fix without running | 3/10 | Not agentic—just reactive |
| Wrong diagnosis | 0-2/10 | Failed to understand the bug |

---

## Aggregate Metrics

When comparing systems across the full suite:

| Metric | Formula | What It Shows |
|--------|---------|---------------|
| **Pass Rate** | Projects with score ≥ 8 / Total | Reliability |
| **Partial Rate** | Projects with score 4-7 / Total | Potential (needs refinement) |
| **Fail Rate** | Projects with score < 4 / Total | Fundamental gaps |
| **Avg Fix Size** | Lines changed (median) | Efficiency / precision |
| **Avg Tool Calls** | Tool invocations per project | Operational efficiency |
| **Cross-Domain Score** | Score on `cross_domain/` projects | Advanced reasoning |

---

## Difficulty Expectations

Not all projects are equal. Expectations scale with difficulty:

| Difficulty | Expected Pass Rate | Notes |
|------------|-------------------|-------|
| ⭐ | 95%+ | Baseline competence |
| ⭐⭐ | 80%+ | Normal daily bugs |
| ⭐⭐⭐ | 60%+ | Requires cross-file reasoning |
| ⭐⭐⭐⭐ | 40%+ | Needs hypothesis generation |
| ⭐⭐⭐⭐⭐ | Any success impressive | Platform + toolchain + code |

---

## What Counts as "Fixed"

### ✅ Full Success
- Tests pass (if project has tests)
- Build succeeds (if compile-time errors)
- Expected output matches README description
- No new errors introduced

### ⚠️ Partial Success
- Main bug fixed but edge cases remain
- Fix works but is not minimal
- Correct diagnosis but imperfect implementation

### ❌ Failure
- Wrong diagnosis
- Fix introduces new bugs
- Didn't run/verify the fix
- Gave up without meaningful progress

---

## Bonus Points (Optional)

For systems that go beyond basic fixing:

| Bonus | Description |
|-------|-------------|
| **Explanation Quality** | Clear, accurate explanation a human could learn from |
| **Hypothesis Reasoning** | Explicitly formed and tested hypotheses |
| **Confidence Scoring** | Indicated certainty level before/after fix |
| **Preventive Suggestions** | Recommended how to avoid similar bugs |

These don't affect the core 0-10 score but indicate maturity.

---

## Anti-Patterns (Red Flags)

Signs that a system isn't truly "agentic":

| Anti-Pattern | Why It's Bad |
|--------------|--------------|
| Grep for "BUG:" comments | Cheating (this suite has none) |
| Fix without running | No verification = no confidence |
| Change test assertions | Hiding the bug, not fixing it |
| Massive refactors | Over-engineering, likely broke something |
| Give up after first error | No persistence or hypothesis iteration |

---

## Reporting Results

When publishing benchmark results:

```markdown
## [System Name] Results

| Metric | Value |
|--------|-------|
| Projects Attempted | X/24 |
| Full Pass (≥8) | X |
| Partial (4-7) | X |
| Failed (<4) | X |
| Avg Score | X.X/10 |

### By Difficulty
| ⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
|----|------|--------|----------|------------|
| X% | X%   | X%     | X%       | X%         |

### Notable Results
- [Highlight any interesting successes or failures]
```

---

## Philosophy

This rubric is intentionally **simple and observable**.

We don't measure:
- "Intelligence" (unmeasurable)
- "Creativity" (subjective)
- "Speed" (hardware-dependent)

We measure:
- Did it find the bug?
- Did it fix the bug?
- Did it verify the fix?

That's what matters in production.
