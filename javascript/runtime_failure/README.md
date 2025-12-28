# Webhook Processor

## Difficulty: ⭐⭐⭐
## Pillar: Runtime Failures

A Node.js service that receives and processes webhooks from various external services (GitHub, Stripe, Slack).

## The Bug

The project contains bugs that cause the symptoms described below. The debugging system must identify and fix these issues.
- Accessing properties on undefined objects
- Missing null checks on optional nested data
- Type coercion errors (string vs number comparisons)
- Unhandled promise rejections in async handlers
- Array method calls on non-array values

## Symptoms

```bash
$ node src/server.js &
$ curl -X POST http://localhost:3002/webhook/github -d '{"event":"push"}'

# Server crash:
TypeError: Cannot read properties of undefined (reading 'commits')
    at processGitHubEvent (src/handlers/github.js:23:28)
```

Or with Stripe webhook:
```bash
TypeError: amount.toFixed is not a function
    at formatPayment (src/handlers/stripe.js:45:22)
```

## Expected Behavior

When fixed, webhooks should process successfully:

```bash
$ curl -X POST http://localhost:3002/webhook/github \
  -H "Content-Type: application/json" \
  -d '{"event":"push","repository":{"name":"test"}}'

{"success":true,"processed":"github:push","timestamp":"2024-01-15T10:30:00Z"}

$ curl -X POST http://localhost:3002/webhook/stripe \
  -H "Content-Type: application/json" \
  -d '{"type":"payment_intent.succeeded","data":{"object":{"amount":1000}}}'

{"success":true,"processed":"stripe:payment_intent.succeeded"}
```

## Project Structure

```
src/
├── server.js            # Express server setup
├── handlers/
│   ├── github.js        # GitHub webhook handler
│   ├── stripe.js        # Stripe webhook handler
│   └── slack.js         # Slack webhook handler
├── middleware/
│   ├── validator.js     # Request validation
│   └── logger.js        # Request logging
└── utils/
    ├── formatter.js     # Data formatting utilities
    └── notifier.js      # Notification sender
```

## Difficulty

⭐⭐⭐ (Intermediate-Advanced) - Requires understanding of JavaScript runtime behavior, null safety patterns, and async error handling.

## What Makes This Realistic

Runtime null/undefined errors are the most common source of production crashes in JavaScript:
- API responses with missing optional fields
- Webhook payloads with varying structures
- Type coercion surprises
- Async operations failing silently
