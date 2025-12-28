# Unity Lifecycle Bug - RPG Character Controller

An RPG Character Controller demonstrating common Unity MonoBehaviour lifecycle bugs.

## Difficulty: ⭐⭐⭐⭐

### OnDestroy Problems
- Accessing destroyed singletons
- Not stopping coroutines
- Scene unload order issues
- `OnApplicationQuit` vs `OnDestroy` timing

### Coroutine Lifecycle
- Coroutines referencing destroyed objects
- `WaitForSeconds` in infinite loops
- Not stopping coroutines on destroy
- Starting coroutines before dependencies ready

### Event/Delegate Leaks
- Static events without cleanup
- Missing unsubscription
- Invoking null delegates
- Scene load event accumulation

## Expected Behavior

### What Should Happen
- Player initializes after all dependencies ready
- Smooth physics-based movement
- Clean scene transitions
- Proper object cleanup on destroy
- Events fire without exceptions

### What Actually Happens
- `NullReferenceException` on scene load
- Jerky movement due to Update/FixedUpdate mixing
- Memory leaks from event subscriptions
- Errors during `OnDestroy` cascade
- Input occasionally missed
- "Destroyed object" access errors

## Build & Run

Import into Unity 2021+ and press Play.

## Testing for Bugs

### Initialization Order
1. Start game - check for null references in console
2. Look for "accessed before Awake" errors
3. Check if singleton is ready when accessed

### Lifecycle Cleanup
1. Load new scene - check for errors
2. Destroy enemy - observe coroutine errors
3. Quit game - check for destroy order issues

### Event Leaks
1. Load scene multiple times
2. Check for duplicate event fires
3. Observe memory growth

## Project Structure

```
lifecycle_bug/
├── Assets/
│   └── Scripts/
│       └── PlayerController.cs    # All buggy code
└── README.md
```

## Unity Lifecycle Order Reference

```
Awake()           → Called when script instance is loaded
OnEnable()        → Called when object becomes enabled
Start()           → Called before first Update
FixedUpdate()     → Called every physics step
Update()          → Called every frame
LateUpdate()      → Called after all Updates
OnDisable()       → Called when object becomes disabled
OnDestroy()       → Called when object is destroyed
OnApplicationQuit() → Called when application quits
```

## Common Patterns (Reference)

```csharp
// Proper singleton
void Awake() {
    if (Instance != null) {
        Destroy(gameObject);
        return;
    }
    Instance = this;
    DontDestroyOnLoad(gameObject);
}

// Proper event cleanup
void OnEnable() {
    EventManager.OnGamePaused += HandlePause;
}
void OnDisable() {
    EventManager.OnGamePaused -= HandlePause;
}

// Proper coroutine cleanup
void OnDestroy() {
    StopAllCoroutines();
}
```
