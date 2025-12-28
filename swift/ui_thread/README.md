# Swift UI Thread - Image Gallery App

An iOS Image Gallery application demonstrating common main thread and UI threading bugs.

## Difficulty: ⭐⭐⭐

## Expected Behavior

### What Should Happen
- UI remains responsive during network calls
- Smooth scrolling in collection view
- Progress updates appear smoothly
- Alerts present correctly
- No crashes from thread violations

### What Actually Happens
- UI freezes for 2+ seconds during load
- Scroll stuttering and jank
- "UI API called on background thread" warnings
- Occasional crashes from thread safety violations
- Purple runtime warnings in Xcode

## Build & Run

```bash
swift build
```

Or open in Xcode and run on iOS Simulator.

## Testing for Bugs

### Main Thread Blocking
1. Launch app - observe 2+ second freeze on load
2. Scroll quickly - observe stuttering
3. Tap image - observe freeze during processing

### Background Thread UI Updates
1. Enable Main Thread Checker in Xcode
2. Load images - observe purple warnings
3. Check console for "UI API called on background thread"

### Alert Presentation
1. Trigger network error
2. Observe crash or warning about background presentation

## Project Structure

```
UIThread/
├── Package.swift
├── UIThread/
│   └── ImageGallery.swift    # All buggy code
└── README.md
```

## Common Symptoms

| Issue | Symptom |
|-------|---------|
| Main thread block | UI freeze, beachball |
| Background UI update | Purple warning, crash |
| Race condition | Random crash, data corruption |
| Wrong thread callback | UI not updating, warnings |

## Debugging Tools

1. **Main Thread Checker** - Enable in Xcode scheme
2. **Thread Sanitizer** - Detects race conditions
3. **Time Profiler** - Find blocking operations
4. **System Trace** - Analyze thread activity
