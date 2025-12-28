# Run Modes & Environment Requirements

This document clarifies what each project requires to execute, helping evaluators set realistic expectations and avoid "this is too hard to reproduce" objections.

---

## Quick Reference Matrix

| Project | Mode | Environment | Headless CI? | Notes |
|---------|------|-------------|--------------|-------|
| **Python** | | | | |
| `static_structural` | Compile | Python 3.8+ | ✅ | Import/syntax errors |
| `runtime_failure` | Runtime | Python 3.8+ | ✅ | Needs `config.json` |
| `test_failure` | Test | Python 3.8+ + pytest | ✅ | `pytest test_calculator.py` |
| `multi_file_bug` | Runtime + Test | Python 3.8+ + Flask | ✅ | API server + integration tests |
| `hypothesis_debugging` | Runtime | Python 3.8+ | ✅ | Data pipeline analysis |
| **JavaScript** | | | | |
| `static_structural` | Compile | Node 18+ | ✅ | Module/export errors |
| `runtime_failure` | Runtime | Node 18+ | ✅ | Async/null issues |
| `test_failure` | Test | Node 18+ + Jest | ✅ | `npm test` |
| `frontend_backend_mismatch` | Runtime | Node 18+ | ✅ | Two processes (client + server) |
| `config_failure` | Runtime | Node 18+ | ✅ | Environment/webpack issues |
| **TypeScript** | | | | |
| `type_errors` | Compile | Node 18+ + tsc | ✅ | `npm run build` |
| `async_failures` | Runtime | Node 18+ + ts-node | ✅ | Promise/race conditions |
| **Java** | | | | |
| `dependency_issue` | Compile | JDK 17+ + Maven | ✅ | `mvn compile` |
| `logic_error` | Runtime | JDK 17+ + Maven | ✅ | `mvn exec:java` |
| `test_failure` | Test | JDK 17+ + Maven | ✅ | `mvn test` |
| **Go** | | | | |
| `runtime_panic` | Runtime | Go 1.21+ | ✅ | `go run main.go` |
| `concurrency_bug` | Runtime | Go 1.21+ | ✅ | `go run -race main.go` |
| **C++** | | | | |
| `header_missing` | Compile | CMake + GCC/Clang | ✅ | `cmake .. && make` |
| `linker_error` | Link | CMake + GCC/Clang | ✅ | Undefined references |
| `memory_issue` | Runtime | CMake + GCC/Clang | ✅ | Safe memory bugs (no UB exploits) |
| **Kotlin/Android** | | | | |
| `android_lifecycle` | Compile + Runtime | Android Studio / Gradle | ⚠️ | Emulator or `./gradlew build` |
| **Swift/iOS** | | | | |
| `build_error` | Compile | Xcode / Swift 5.9+ | ⚠️ | macOS only, `swift build` |
| `optionals_crash` | Runtime | Xcode / Swift 5.9+ | ⚠️ | Force-unwrap failures |
| `ui_thread` | Runtime | Xcode + Simulator | ❌ | Requires iOS Simulator |
| **Unity/C#** | | | | |
| `lifecycle_bug` | Runtime | Unity 2022+ | ❌ | Editor required |
| `serialization_error` | Runtime | Unity 2022+ | ❌ | Inspector + Play mode |
| `scene_mismatch` | Runtime | Unity 2022+ | ❌ | Asset-code desync |

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully headless—runs in CI/terminal with no GUI |
| ⚠️ | Compile-only headless; runtime needs device/emulator |
| ❌ | Requires IDE or platform-specific tooling |

---

## Recommended Evaluation Tiers

### Tier 1: Headless CI (all platforms)
Run these in any CI environment (GitHub Actions, Azure Pipelines, local terminal):
- All Python projects
- All JavaScript/TypeScript projects
- All Java projects
- All Go projects
- All C++ projects (with CMake)

### Tier 2: Platform-Specific Build (macOS / Windows)
- **Kotlin/Android**: `./gradlew assembleDebug` on any OS; full test needs emulator
- **Swift/iOS**: `swift build` on macOS; runtime tests need Simulator

### Tier 3: IDE-Required
- **Unity**: Must open in Unity Editor to test MonoBehaviour lifecycle, serialization, and scene issues

---

## Environment Setup Scripts

Each project folder contains (or should contain):
- `README.md` – Symptoms, expected behavior, verification steps
- Build/run commands documented in README

For CI automation, a future `scripts/` folder will provide:
- `run_headless.ps1` / `run_headless.sh` – Execute all Tier 1 projects
- `report_results.py` – Aggregate pass/fail/partial scores

---

## Handling "Too Hard to Reproduce" Concerns

This suite is intentionally diverse. Not every evaluator will have every environment. The recommended approach:

1. **Start with Tier 1** – 100% headless, no excuses
2. **Report partial coverage** – "Evaluated 18/24 projects (Tier 1 + 2)"
3. **Use static analysis for Tier 3** – Even without Unity Editor, an agent can identify obvious issues in C# scripts

The goal is not to gatekeep, but to measure *how far* a system can reason across domains.
