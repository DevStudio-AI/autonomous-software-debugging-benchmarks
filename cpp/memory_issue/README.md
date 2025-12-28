# C++ Memory Issue - Entity Component System

An Entity Component System demonstrating common C++ memory management bugs.

## Difficulty: ⭐⭐⭐⭐⭐

## Expected Behavior

### What Should Happen
- All allocated memory is freed
- Pointers are valid when used
- Copies are independent
- Reference counts are accurate

### What Actually Happens
```
==12345== LEAK SUMMARY:
==12345==    definitely lost: 262,144 bytes in 1 blocks
==12345==    indirectly lost: 0 bytes in 0 blocks

AddressSanitizer: heap-use-after-free
AddressSanitizer: double-free
AddressSanitizer: heap-buffer-overflow
```

## Build & Run

```bash
mkdir build && cd build
cmake -DENABLE_ASAN=ON ..
make
./MemoryDemo

# Or with Valgrind:
cmake -DENABLE_DEBUG=ON ..
make
valgrind --leak-check=full ./MemoryDemo
```

## Memory Bug Summary

| Bug Type | Location | Symptom |
|----------|----------|---------|
| Leak | `Sprite` | Valgrind reports lost bytes |
| Dangling | `getComponent` | Crash/corruption on access |
| Double Free | `shallowClone` | SIGABRT/crash |
| Use After Free | `removeComponent` | Undefined behavior |
| Overflow | `operator[]` | Memory corruption |
| Shallow Copy | `MyString` | Double free on destroy |

## Project Structure

```
memory_issue/
├── CMakeLists.txt
├── include/
│   └── EntitySystem.h    # Classes with memory bugs
├── src/
│   └── main.cpp          # Bug demonstrations
└── README.md
```
