# C++ Header/Include Issues - Game Engine Framework

A game engine framework demonstrating common C++ header and include-related bugs.

## Difficulty: ⭐⭐⭐⭐

## Expected Errors

### Compilation Errors
```
GameTypes.h:15:5: error: 'string' is not a member of 'std'
GameTypes.h:16:5: error: 'vector' is not a member of 'std'
GameTypes.h:17:5: error: field 'transform' has incomplete type 'Game::Transform'
Components.h:12:5: error: 'cout' is not a member of 'std'
Entity.h:45:5: error: 'type_index' is not a member of 'std'
```

### Linker Errors (if compilation succeeds)
```
multiple definition of `Game::Entity::nextId'
multiple definition of `Game::initializeDefaultWorld(Game::World&)'
```

## Build & Run

```bash
mkdir build && cd build
cmake ..
make
# Build will fail with many errors
```

## Project Structure

```
header_missing/
├── CMakeLists.txt
├── include/
│   ├── GameTypes.h      # Missing guard, circular include
│   ├── Components.h     # Missing guard, missing includes
│   ├── Entity.h         # Missing #endif, ODR issues
│   └── World.h          # Has #pragma once, uses broken headers
├── src/
│   ├── main.cpp         # Primary translation unit
│   └── helper.cpp       # Second TU for ODR demonstration
└── README.md
```
