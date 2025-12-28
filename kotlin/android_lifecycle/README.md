# Android Lifecycle Bugs - Notes App

A Notes application demonstrating common Android lifecycle and threading bugs.

## Difficulty: ⭐⭐⭐⭐

## Expected Behavior

### What Should Happen
- Notes app launches without memory leaks
- Configuration changes preserve state
- Background operations don't block UI
- Listeners cleaned up when Activity destroyed
- Fragments safely access Activity

### What Actually Happens
- Memory leaks when rotating device
- ANR when loading notes
- Crash: CalledFromWrongThreadException
- TransactionTooLargeException with many notes
- UninitializedPropertyAccessException in Fragment
- IllegalStateException: Fragment not attached

## Build & Run

```bash
./gradlew assembleDebug
./gradlew installDebug
```

## Testing for Bugs

### Memory Leak Detection
1. Rotate device repeatedly
2. Use LeakCanary or Memory Profiler
3. Check for retained MainActivity instances

### Fragment Crashes
1. Open note detail
2. Rotate while note is loading
3. Observe crash from lateinit or requireActivity()

## Project Structure

```
app/src/main/java/com/notes/
├── ui/
│   └── MainActivity.kt      # Lifecycle bugs, Fragment with issues
├── model/
│   └── Note.kt              # Data model with Parcelable
└── data/
    ├── NotesDatabase.kt     # Room database
    └── NotesRepository.kt   # Listener pattern (leak-prone)
```
