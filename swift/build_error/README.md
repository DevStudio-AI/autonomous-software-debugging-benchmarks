# Swift Build Error - E-commerce Cart

An E-commerce Cart application with intentional Swift compilation errors for debugging practice.

## Difficulty: ⭐⭐⭐⭐

### Async/Await Errors
- Missing `async` annotation
- `await` in non-async context
- Calling async without `await`
- Return type mismatch in async function

### Extension Errors
- Extending non-existent type
- Conflicting/impossible generic constraints
- Using non-existent methods

### Memory Management Errors
- `weak` reference to struct (non-class type)
- Strong reference cycles in closures

## Expected Behavior

### What Should Happen
- Project compiles successfully
- All types conform to required protocols
- Generic constraints are satisfiable
- Access modifiers are consistent

### What Actually Happens
```
error: type 'Product' does not conform to protocol 'Hashable'
error: cannot convert value of type 'String' to expected argument type 'Int'
error: 'AnyObject' requires a class type
error: property 'status' not initialized at call
error: cannot override fileprivate method with public method
error: missing argument for parameter 'email' in call
... 30+ compilation errors
```

## Build & Run

```bash
swift build
# Expected: Multiple compilation errors
```

## Error Categories Summary

| Category | Count | Example |
|----------|-------|---------|
| Type Mismatch | 8 | `Int` vs `String` enum |
| Protocol | 6 | Missing conformance |
| Generics | 4 | Constraint not satisfied |
| Access | 4 | Modifier conflicts |
| Closure | 3 | Escaping issues |
| Init | 3 | Property ordering |
| Async | 3 | Missing await |
| Extension | 3 | Invalid constraints |

## Project Structure

```
BuildError/
├── Package.swift
├── BuildError/
│   └── EcommerceCart.swift    # All buggy code
└── README.md
```

## Fixing Strategy

1. Start from top of file, fix first error
2. Rebuild - cascade errors will resolve
3. Add missing protocol conformances first
4. Fix type mismatches second
5. Address access control last
