# Unity Serialization Error - Inventory System

An Inventory System demonstrating common Unity serialization bugs and pitfalls.

## Difficulty: ⭐⭐⭐⭐

### Unsupported Types
- `Dictionary<K,V>` - not serialized
- `HashSet<T>` - not serialized
- Nullable types (`int?`) - not serialized
- Multidimensional arrays (`T[,]`) - not serialized
- Generic classes (`Container<T>`) - not serialized
- Interfaces (`IItem`) - not serialized
- Delegates/Events - not serialized

### Property Serialization
- Properties don't serialize (only fields)
- Computed properties (`=> expression`) ignored
- Auto-properties need backing field

### Unity Object References
- `Transform`, `GameObject` references null after JSON load
- `Material`, `Sprite`, `AudioClip` lose references
- Component references in plain `[Serializable]` classes fail
- Prefab references in non-MonoBehaviour classes

### Polymorphism Problems
- Derived class data lost without `[SerializeReference]`
- Base class reference only stores base fields
- List of derived types becomes list of base types

### Save System Pitfalls
- `DateTime` needs special handling
- `Guid` doesn't JSON-serialize well
- Scene references break after load
- Transform data needs manual extraction

## Expected Behavior

### What Should Happen
- All inventory data visible in Inspector
- Dictionary lookups work after reload
- Derived item types retain their data
- Save/load preserves all game state

### What Actually Happens
- Empty Inspector fields
- Dictionary empty after play mode
- Weapon damage = 0 after deserialization
- Transform references null after load
- "Missing reference" errors

## Build & Run

Import into Unity 2021+ and examine Inspector values.

## Testing for Bugs

### Inspector Serialization
1. Add `PlayerInventory` component
2. Check which fields appear in Inspector
3. Enter play mode and exit - check data persistence

### Dictionary Loss
1. Add items to `itemCounts` dictionary
2. Exit play mode
3. Re-enter play mode - dictionary is empty

### Polymorphism Test
1. Add `Weapon` and `Armor` to `items` list
2. Save scene, close Unity, reopen
3. Check if `damage` and `defense` fields preserved

### Save/Load Test
1. Call `SaveManager.Save()`
2. Check `PlayerPrefs` JSON structure
3. Call `Load()` - check for null references

## Project Structure

```
serialization_error/
├── Assets/
│   └── Scripts/
│       └── InventorySystem.cs    # All buggy code
└── README.md
```

## Unity Serialization Rules

### Serialized Types
✅ Primitives (int, float, string, bool)
✅ Enums
✅ Arrays of serializable types
✅ List<T> of serializable types
✅ UnityEngine structs (Vector3, Color, etc.)
✅ UnityEngine.Object references (on MonoBehaviours)
✅ Classes with [Serializable]

### Not Serialized
❌ Dictionary<K,V>
❌ HashSet<T>
❌ Nullable types
❌ Properties
❌ Static/const/readonly fields
❌ Delegates/Events
❌ Interfaces
❌ Generic classes
❌ Multidimensional arrays
