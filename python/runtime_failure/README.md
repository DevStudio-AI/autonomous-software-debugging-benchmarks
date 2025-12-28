# Task Automation Engine - Runtime Failures

## Difficulty: ⭐⭐⭐
## Pillar: Runtime Failures

## What This Project Does (When Fixed)

A personal task automation engine that:
- Loads task definitions from JSON configuration
- Executes tasks on schedule with dependency resolution
- Tracks execution history and statistics
- Outputs a formatted task execution report

## Symptoms

When you run `python engine.py`:
- The application starts but crashes during execution
- Error messages point to various runtime issues
- Some errors only manifest with specific data combinations
- The crash location may vary between runs

Observed error patterns:
- `TypeError: 'NoneType' object is not subscriptable`
- `KeyError` on seemingly valid keys
- `AttributeError` accessing object properties
- Division by zero in statistics calculation

## Expected Success State

```
╔════════════════════════════════════════════════════════╗
║           TASK AUTOMATION ENGINE v1.0                  ║
╠════════════════════════════════════════════════════════╣
║ Loading tasks from config...                           ║
║ Found 5 tasks with 3 dependency chains                 ║
║                                                        ║
║ Executing task: backup_database                        ║
║   → Dependencies: [none]                               ║
║   → Status: ✓ SUCCESS (1.2s)                          ║
║                                                        ║
║ Executing task: sync_files                             ║
║   → Dependencies: [backup_database]                    ║
║   → Status: ✓ SUCCESS (0.8s)                          ║
║                                                        ║
║ Executing task: send_report                            ║
║   → Dependencies: [backup_database, sync_files]        ║
║   → Status: ✓ SUCCESS (0.3s)                          ║
║                                                        ║
║ ─────────────────────────────────────────────────────  ║
║ EXECUTION SUMMARY                                      ║
║   Total Tasks: 5                                       ║
║   Successful: 5                                        ║
║   Failed: 0                                            ║
║   Average Time: 0.76s                                  ║
║   Success Rate: 100%                                   ║
╚════════════════════════════════════════════════════════╝
```

## How to Verify Success

```bash
python engine.py
```

All tasks should execute in dependency order, and a summary report should display.

## What Makes This Realistic

- Missing environment variable handling (common in deployment)
- Null reference when config values are optional
- Type coercion bugs with JSON data
- Edge cases in dependency resolution
- Statistics calculation with empty data sets
- The bugs compound in ways that require understanding data flow

## Files

- `engine.py` - Main execution engine
- `config.json` - Task configuration
- `tasks/executor.py` - Task execution logic
- `tasks/scheduler.py` - Dependency resolution
- `models.py` - Data structures
- `reporter.py` - Output formatting
