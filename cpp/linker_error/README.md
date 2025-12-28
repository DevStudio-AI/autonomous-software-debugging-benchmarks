# C++ Linker Error - Game Engine

A Game Engine project demonstrating common C++ linker errors.

## Difficulty: ⭐⭐⭐⭐

## Expected Behavior

### What Should Happen
- Project compiles and links successfully
- All symbols resolve correctly
- Executable runs without errors

### What Actually Happens
```
undefined reference to `GameConfig::screenWidth'
undefined reference to `GameConfig::screenHeight'
undefined reference to `Component::~Component()'
undefined reference to `AudioManager::getInstance()'
undefined reference to `MathUtils::lerp(float, float, float)'
undefined reference to `operator+(Vector2 const&, Vector2 const&)'
undefined reference to `globalRenderer'
undefined reference to `engineVersion'
```

## Build & Run

```bash
mkdir build && cd build
cmake ..
make
# Expected: Linker errors
```

## Linker Error Categories

| Error Type | Example Symbol | Cause |
|------------|---------------|-------|
| Static member | `GameConfig::screenWidth` | Missing definition |
| Virtual method | `Component::~Component()` | Declared not defined |
| Extern variable | `globalRenderer` | Never defined |
| Friend function | `operator+` | Declaration only |
| Template | `ResourceManager<int>::load` | Impl in .cpp |
| Free function | `MathUtils::lerp` | Not implemented |

## Project Structure

```
linker_error/
├── CMakeLists.txt
├── include/
│   └── GameEngine.h     # Declarations
├── src/
│   ├── main.cpp         # Uses broken symbols
│   └── GameEngine.cpp   # Missing definitions
└── README.md
```

## Common Fixes (Reference)

```cpp
// Static member - add in .cpp:
int GameConfig::screenWidth = 0;

// Virtual destructor - define:
Component::~Component() { }

// Extern variable - define:
Renderer* globalRenderer = nullptr;

// Friend function - define:
Vector2 operator+(const Vector2& a, const Vector2& b) {
    return Vector2(a.x + b.x, a.y + b.y);
}

// Template - put implementation in header:
template<typename T>
void ResourceManager<T>::load(const std::string& path) {
    // Implementation in header
}

// Non-inline function - make inline:
inline int calculateDamage(int baseDamage, int armor) {
    return baseDamage - (armor / 2);
}
```
