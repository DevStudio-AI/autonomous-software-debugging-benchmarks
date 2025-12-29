# URL Shortener Service

## Difficulty: ⭐⭐⭐
## Pillar: Runtime Failures

A Go HTTP service for creating and managing shortened URLs with analytics.

## The Bug

The project contains runtime panic bugs that crash the server during normal operations. The debugging system must identify and fix these issues based on the panic stack traces below.

## Symptoms

```bash
$ go run main.go
URL Shortener running on :8080

$ curl -X POST http://localhost:8080/shorten -d '{"url":"https://example.com"}'
# Server crashes:

panic: runtime error: invalid memory address or nil pointer dereference
[signal SIGSEGV: segmentation violation code=0x1 addr=0x0 pc=0x...]
goroutine 1 [running]:
main.handleShorten(...)
        main.go:95
```

```bash
$ curl http://localhost:8080/r/abc123
# If store was initialized but URL not found:

panic: runtime error: invalid memory address or nil pointer dereference
[signal SIGSEGV: segmentation violation code=0x1 addr=0x8 pc=0x...]
goroutine 1 [running]:
main.handleRedirect(...)
        main.go:105
```

```bash
$ curl http://localhost:8080/stats?short=abc
# Panics accessing url.Tags[0]:

panic: runtime error: index out of range [0] with length 0
```

## Expected Behavior

```bash
$ go run main.go
URL Shortener running on :8080

$ curl -X POST http://localhost:8080/shorten \
    -d '{"url":"https://example.com","tags":["test"]}'
{
  "original": "https://example.com",
  "short": "abc123",
  "created_at": "2024-01-15T10:30:00Z",
  "tags": ["test"]
}

$ curl http://localhost:8080/r/abc123
# 302 Redirect to https://example.com

$ curl http://localhost:8080/stats?short=abc123
{
  "original": "https://example.com",
  "access_count": 1,
  "tag_count": 1,
  "primary_tag": "test"
}
```

## Project Structure

```
runtime_panic/
├── main.go      # All handlers and types with bugs
├── go.mod       # Module definition
└── README.md
```

## Difficulty

⭐⭐⭐ (Intermediate) - Requires understanding of:
- Go's nil pointer semantics
- Defensive programming patterns
- Slice bounds checking
- Map nil vs empty behavior

## What Makes This Realistic

Go's "happy path" programming style often leads to:
- Missing nil checks after map lookups
- Forgetting to initialize global variables
- Assuming slices are never empty
- Not handling edge cases in HTTP handlers
- Panics that only occur with specific input patterns
