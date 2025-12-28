# Event Processing Pipeline

## Difficulty: ⭐⭐⭐⭐
## Pillar: Runtime Failures / Hypothesis-Driven

A TypeScript event processing system with parallel execution, retries, and error handling.

## The Bug

The project contains bugs that cause the symptoms described below. The debugging system must identify and fix these issues.
- Missing await on async operations
- Promise.all with failing promises not handled
- Race conditions in shared state
- Unhandled promise rejections
- Incorrect Promise.race usage

## Symptoms

```bash
$ npm run process

Processing 5 events...
# Hangs indefinitely or crashes with:
UnhandledPromiseRejectionWarning: Error: Event processing failed
    at processEvent (src/services/processor.ts:45:15)

# Or produces wrong results due to race conditions:
Expected: [1, 2, 3, 4, 5] processed in order
Got: [1, 3, 2, 5, 4] with missing events
```

## Expected Behavior

When fixed, events process reliably:

```bash
$ npm run process

Starting event pipeline...
✓ Processing 5 events in parallel (max 3 concurrent)
  ✓ Event 1 processed (45ms)
  ✓ Event 2 processed (32ms)
  ✓ Event 3 processed (28ms)
  ✓ Event 4 processed (41ms)
  ✓ Event 5 processed (35ms)
✓ All events processed successfully
Results saved to output.json
```

## Project Structure

```
src/
├── index.ts           # Entry point
├── services/
│   ├── processor.ts   # Event processor
│   ├── queue.ts       # Event queue
│   └── storage.ts     # Result storage
└── utils/
    ├── retry.ts       # Retry logic
    └── limiter.ts     # Concurrency limiter
```

## Difficulty

⭐⭐⭐⭐ (Advanced) - Requires deep understanding of JavaScript event loop, Promise behavior, and async patterns.

## What Makes This Realistic

- They often work in development but fail in production under load
- Race conditions appear intermittently
- Missing awaits can cause subtle timing issues
- Error handling in async code requires careful attention
