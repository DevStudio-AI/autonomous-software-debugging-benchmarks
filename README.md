# Autonomous Software Debugging Benchmarks

A language- and platform-spanning benchmark suite for evaluating autonomous debugging systems.

> **⚠️ This is the evaluation version.** Code contains no hints or solution markers. For learning/reference with annotated bugs, see [real-world-debugging-examples](https://github.com/DevStudio-AI/real-world-debugging-examples).

## Quick Links

| Document | Purpose |
|----------|---------|
| [CAPABILITIES.md](CAPABILITIES.md) | What "agentic debugging" means and what this suite proves |
| [EVALUATION.md](EVALUATION.md) | Scoring rubric for judging success |
| [RUN_MODES.md](RUN_MODES.md) | Environment requirements per project (headless vs IDE) |

## Purpose

This repository contains **real project files with purposeful errors** designed to test and calibrate agentic debugging capabilities. Each project:

- Contains realistic, non-trivial code (not toy examples)
- Has errors that mirror real-world failure patterns
- Produces a **visible, satisfying result** when fixed
- Documents expected behavior without revealing solutions

## What This Suite Tests

### The 6 Capability Pillars

| Pillar | What It Proves | Where Tools Fail |
|--------|----------------|------------------|
| **Static + Structural** | Parsing, AST analysis, syntax repair | Missing file-to-file awareness |
| **Runtime Failures** | Execution awareness, environment reasoning | Stop at "suggestion" without re-execution |
| **Test Failures** | Intent reasoning, not just syntax repair | Can't align fixes to test intent |
| **Multi-File / Cross-Layer** | Agentic reasoning across boundaries | No coordinated multi-file fixes |
| **Configuration & Infra** | System-level understanding | Hallucinate config solutions |
| **Hypothesis-Driven** | Proactive reasoning, not reactive | No evidence gathering or confidence scoring |

## Language Coverage

| Category | Language | Why |
|----------|----------|-----|
| Dynamic | Python | AI/ML ecosystem, debugging sweet spot |
| Web | JavaScript / TypeScript | Frontend + backend |
| Systems | Go | Type & compile rigor |
| Enterprise | Java | Real-world expectations |
| Mobile | Kotlin (Android), Swift (iOS) | Build system + platform constraints |
| Game | Unity (C#), C++ | Engine-aware reasoning, asset coordination |

## Repository Structure

```
autonomous-software-debugging-benchmarks/
├── python/
│   ├── static_structural/      # Import/syntax errors
│   ├── runtime_failure/        # Environment, null refs, type coercion
│   ├── test_failure/           # Failing tests revealing logic flaws
│   ├── multi_file_bug/         # Cross-module contract violations
│   └── hypothesis_debugging/   # Ambiguous symptoms, multiple causes
├── javascript/
│   ├── static_structural/      # Module errors, broken exports
│   ├── runtime_failure/        # Async bugs, undefined access
│   ├── test_failure/           # Jest tests revealing edge cases
│   ├── frontend_backend_mismatch/  # API contract drift
│   └── config_failure/         # Env, port, config issues
├── typescript/
│   ├── type_errors/            # Generic constraints, inference failures
│   └── async_failures/         # Promise chains, race conditions
├── java/
│   ├── dependency_issue/       # Maven resolution
│   ├── logic_error/            # Off-by-one, state bugs
│   └── test_failure/           # JUnit revealing intent mismatch
├── go/
│   ├── runtime_panic/          # Nil pointer, slice bounds
│   └── concurrency_bug/        # Race conditions, deadlocks
├── kotlin/
│   └── android_lifecycle/      # Activity/Fragment lifecycle issues
├── swift/
│   ├── optionals_crash/        # Force unwrap failures
│   ├── build_error/            # Missing Info.plist keys
│   └── ui_thread/              # Main thread violations
├── unity/
│   ├── lifecycle_bug/          # MonoBehaviour order issues
│   ├── serialization_error/    # Missing SerializeField
│   └── scene_mismatch/         # Asset-code desync
├── cpp/
│   ├── linker_error/           # Undefined references
│   ├── memory_issue/           # Safe memory bugs
│   └── header_missing/         # Include path problems
└── cross_domain/
    └── unity_node_contract/    # Multi-language integration
```

## How to Use This Suite

### For Evaluation

1. Point your debugging system at any project folder
2. Observe: Does it identify the root cause?
3. Observe: Does it execute and verify the fix?
4. Observe: Does it produce the expected result?

### Success Criteria

A debugging system demonstrates capability when it:

- **Localizes** the error to specific file(s) and line(s)
- **Explains** why the error occurs (not just what)
- **Fixes** with minimal, targeted changes
- **Verifies** by running the code/tests
- **Produces** the documented expected output

### What Success Looks Like

Each project's README describes:
- What's broken (symptoms only)
- Expected behavior when fixed
- How to verify success

No solutions are provided. The debugger must reason independently.

## Difficulty Ratings

| Rating | Meaning | Example Projects |
|--------|---------|------------------|
| ⭐ | Single file, obvious error | — |
| ⭐⭐ | Normal bugs developers hit daily | `python/test_failure`, `java/test_failure`, `javascript/test_failure`, `typescript/type_errors` |
| ⭐⭐⭐ | Cross-layer reasoning required | `python/runtime_failure`, `javascript/runtime_failure` |
| ⭐⭐⭐⭐ | Hypothesis generation needed | `python/multi_file_bug`, `go/concurrency_bug`, `typescript/async_failures` |
| ⭐⭐⭐⭐⭐ | Platform + toolchain + code | `cross_domain/unity_node_contract`, `cpp/header_missing` |

### Difficulty Distribution

```
⭐      ░░░░░░░░░░░░░░░░░░░░  0%   (baseline, not included)
⭐⭐    ████████░░░░░░░░░░░░  35%  (credibility anchors)
⭐⭐⭐  ██████░░░░░░░░░░░░░░  25%  (intermediate)
⭐⭐⭐⭐ ██████░░░░░░░░░░░░░░  25%  (advanced)
⭐⭐⭐⭐⭐████░░░░░░░░░░░░░░░░  15%  (expert)
```

## Contributing

To add a new test case:

1. Create a realistic, minimal project that does something useful
2. Introduce a single, realistic failure pattern
3. Document symptoms and expected success state
4. Create `INSTRUCTOR_NOTES.md` with solution details (excluded from eval)
6. Tag with difficulty rating and capability pillar

## Evaluation Mode

For fair benchmarking, use the sanitization script to create an answer-free copy:

```powershell
.\scripts\sanitize.ps1 -SourceDir . -OutputDir ./eval
```


## License

MIT - Use freely for benchmarking, teaching, or tool evaluation.

---

*This suite is designed for general use in evaluating any autonomous debugging system.*
