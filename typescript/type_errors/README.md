# API Client Library

## Difficulty: ⭐⭐
## Pillar: Static + Structural

A TypeScript client library for interacting with a REST API, featuring type-safe requests and responses.

## The Bug

The project contains TypeScript type errors that prevent compilation. The debugging system must identify and fix these issues based on the compiler errors below.

## Symptoms

```bash
$ npm run build

src/services/client.ts:45:5 - error TS2322: Type 'Response<unknown>' is not assignable to type 'Response<T>'.
  Type 'unknown' is not assignable to type 'T'.

src/models/user.ts:23:3 - error TS2741: Property 'email' is missing in type '{ id: number; name: string; }' but required in type 'User'.

src/utils/transform.ts:12:10 - error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.

Found 12 errors.
```

## Expected Behavior

When fixed, the project compiles and runs:

```bash
$ npm run build
✓ Compiled successfully

$ npm run demo
Fetching users...
✓ Found 3 users
✓ User 1: Alice (alice@example.com)
Creating new user...
✓ Created user: Bob (id: 4)
```

## Project Structure

```
src/
├── index.ts           # Main exports
├── models/
│   ├── user.ts        # User type definitions
│   ├── post.ts        # Post type definitions
│   └── response.ts    # API response types
├── services/
│   ├── client.ts      # HTTP client
│   ├── users.ts       # User service
│   └── posts.ts       # Post service
└── utils/
    ├── transform.ts   # Data transformers
    └── validators.ts  # Type validators
```

## Difficulty

⭐⭐⭐ (Intermediate-Advanced) - Requires understanding of TypeScript generics, type guards, and interface composition.

## What Makes This Realistic

Type errors are common when:
- API response structures change
- Refactoring interfaces without updating all usages
- Working with generic types and type inference
- Handling optional vs required properties
- Converting between similar but incompatible types
