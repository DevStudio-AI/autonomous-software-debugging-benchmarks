# Worker Pool System

## Difficulty: ⭐⭐⭐⭐
## Pillar: Hypothesis-Driven / Runtime Failures

A Go concurrent job processing system with worker pools, event buses, and transaction management.

## The Bug

The project contains bugs that cause the symptoms described below. The debugging system must identify and fix these issues.

## Symptoms

```bash
$ go run main.go
Concurrency Bug Demo
Completed jobs: 10
Counter value: 7823 (expected: 10000)  # Race condition!
Transaction demo complete (might deadlock)

# Sometimes:
fatal error: concurrent map writes
```

```bash
$ go run -race main.go
==================
WARNING: DATA RACE
Write at 0x00c0000a4000 by goroutine 8:
  main.(*Worker).processJob()
      main.go:82 +0x...

Previous write at 0x00c0000a4000 by goroutine 9:
  main.(*Worker).processJob()
      main.go:82 +0x...
==================

==================
WARNING: DATA RACE
Read at 0x00c0000a6000 by main goroutine:
  main.main()
      main.go:198 +0x...

Previous write at 0x00c0000a6000 by goroutine 7:
  main.(*Counter).Increment()
      main.go:47 +0x...
==================
```

## Expected Behavior

```bash
$ go run -race main.go
Concurrency Bug Demo
Completed jobs: 10
Counter value: 10000 (expected: 10000)
Transaction demo complete

# No race warnings, no deadlocks
```

## Project Structure

```
concurrency_bug/
├── main.go      # Worker pool, event bus, and transaction manager
├── go.mod       # Module definition
└── README.md
```

## Difficulty

⭐⭐⭐⭐ (Advanced) - Requires understanding of:
- Go memory model
- Mutex and lock ordering
- Channel semantics
- Race detector interpretation
- Goroutine lifecycle management

## What Makes This Realistic

Concurrency bugs are notoriously hard to find and fix:
- They may only manifest under specific timing
- Race detector finds some but not all issues
- Deadlocks might only occur under load
- Code appears to work in simple tests
- Production traffic reveals hidden bugs
