# Unity Scene Mismatch - Game Manager

A Game Manager system demonstrating common Unity scene loading and object reference bugs.

## Difficulty: ⭐⭐⭐⭐

### Event Subscription Leaks
- `SceneManager.sceneLoaded` without unsubscribe
- Static events accumulating callbacks
- Event handlers holding dead references
- Memory leaks from scene cycling

### Scene Index Fragility
- Hardcoded scene indices change with build settings
- Scene name string comparisons
- `buildIndex + 1` assumptions
- Missing scenes in build

## Expected Behavior

### What Should Happen
- Smooth scene transitions
- Manager objects persist correctly
- UI updates for correct scene
- Player references always valid
- Clean memory after scene unload

### What Actually Happens
- `NullReferenceException` after scene load
- `MissingReferenceException` on destroyed objects
- Duplicate GameManager instances
- UI frozen/invisible after transition
- Memory growing with each scene load
- Audio continuing from wrong scene

## Build & Run

Import into Unity 2021+ and test scene transitions.

## Testing for Bugs

### Reference Invalidation
1. Start in MainMenu scene
2. Load Game scene
3. Check console for null reference errors
4. Access UI elements - observe failures

### Singleton Duplication
1. Load GameScene
2. Return to MainMenu
3. Load GameScene again
4. Check hierarchy for duplicate managers

### Async Timing
1. Trigger async scene load
2. Observe code running before load completes
3. Check for errors from accessing unloaded objects

### Event Leaks
1. Load and unload scenes repeatedly
2. Monitor memory usage
3. Check for duplicate event fires

## Project Structure

```
scene_mismatch/
├── Assets/
│   └── Scripts/
│       └── SceneManagement.cs    # All buggy code
└── README.md
```

## Unity Scene Loading Timeline

```
1. LoadScene() called
2. Current scene objects get OnDisable()
3. Current scene objects get OnDestroy()
4. New scene objects instantiated
5. New scene objects get Awake()
6. SceneManager.sceneLoaded fires
7. New scene objects get OnEnable()
8. New scene objects get Start()
9. First Update() runs
```

## Common Symptoms

| Issue | Symptom |
|-------|---------|
| Stale reference | MissingReferenceException |
| Early access | NullReferenceException |
| Duplicate singleton | Multiple audio playing |
| Event leak | Callbacks fire multiple times |
| Scene index wrong | Wrong scene loads |
