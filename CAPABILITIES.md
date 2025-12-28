# Agentic Debugging Capabilities

## What This Suite Proves

**Agentic debugging** is the ability for an AI system to autonomously diagnose and fix software defects through iterative evidence gathering, hypothesis formation, and verification—not just pattern-matching against known error messages.

Unlike code completion or one-shot fixes, agentic debugging requires:
- **Reproduction** – Running or building the code to observe symptoms firsthand
- **Localization** – Tracing across files, layers, and systems to find root causes
- **Hypothesis testing** – Forming theories and gathering evidence to confirm or refute them
- **Minimal repair** – Making targeted changes without introducing regressions
- **Verification** – Re-running tests/builds to confirm the fix actually works

This suite measures whether a debugging system can perform these steps autonomously, or whether it merely suggests fixes without validating them.

---

## The 6 Capability Pillars

| Pillar | What It Proves | Example Folders | Where Most Tools Fail |
|--------|----------------|-----------------|----------------------|
| **Static + Structural** | Parse errors, import resolution, syntax repair | `python/static_structural`, `javascript/static_structural`, `cpp/header_missing` | Missing file-to-file dependency awareness |
| **Runtime Failures** | Execution context, environment reasoning, null/undefined handling | `python/runtime_failure`, `javascript/runtime_failure`, `go/runtime_panic` | Stop at "suggestion" without re-execution |
| **Test Failures** | Intent reasoning—understanding *what* the test wants, not just *that* it failed | `python/test_failure`, `java/test_failure`, `javascript/test_failure` | Fix syntax but break semantics |
| **Multi-File / Cross-Layer** | Coordinated fixes across contracts, schemas, handlers | `python/multi_file_bug`, `javascript/frontend_backend_mismatch` | No coordinated multi-file reasoning |
| **Configuration & Infra** | Build systems, environment variables, toolchain issues | `javascript/config_failure`, `java/dependency_issue`, `cpp/linker_error` | Hallucinate config paths or versions |
| **Hypothesis-Driven** | Proactive evidence gathering under ambiguity | `python/hypothesis_debugging`, `go/concurrency_bug` | No confidence scoring or iterative narrowing |

---

## What Distinguishes Agentic from Reactive Debugging

| Reactive Tool | Agentic System |
|---------------|----------------|
| Reads error message → suggests fix | Runs code → observes behavior → reasons about cause |
| Single-file focus | Traces data flow across boundaries |
| One-shot suggestion | Iterates: fix → verify → refine |
| Assumes error message is complete | Gathers additional evidence (logs, state, related files) |
| Confidence = pattern match strength | Confidence = evidence from execution |

---

## Success Criteria

A system demonstrates **true agentic capability** when it:

1. **Reproduces** – Executes or builds the project to see the failure
2. **Localizes** – Identifies the root cause file(s) and line(s) without hints
3. **Explains** – Articulates *why* the bug occurs (not just *what* to change)
4. **Fixes minimally** – Changes only what's necessary
5. **Verifies** – Re-runs tests/build to confirm success
6. **Avoids regressions** – Doesn't break other functionality

---

## Who This Suite Is For

- **Tool builders** – Benchmark your debugging agent against realistic, multi-domain challenges
- **Researchers** – Study the gap between pattern-matching and true reasoning
- **Evaluators** – Compare systems on reproducible, unambiguous tasks
- **Skeptics** – See exactly what "agentic" means and whether a system achieves it
