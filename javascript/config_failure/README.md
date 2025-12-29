# Database Migration Tool

## Difficulty: ⭐⭐⭐
## Pillar: Configuration & Infra

A Node.js CLI tool for managing database migrations across different environments (development, staging, production).

## The Bug

The project contains configuration and environment handling bugs that prevent the tool from working correctly across environments. The debugging system must identify and fix these issues based on the symptoms below.

## Symptoms

```bash
$ NODE_ENV=production node src/migrate.js up

Error: Cannot find config file at /app/config/production.json
    at loadConfig (src/config/loader.js:15:11)
```

Or:

```bash
$ DB_SSL=false node src/migrate.js up

# SSL is still being used despite explicitly disabling it
Error: SSL connection required but certificate not found
```

Or:

```bash
$ node src/migrate.js status

Error: DATABASE_URL is not defined
    at validateConfig (src/config/validator.js:8:15)
# Even though DATABASE_URL is in .env file
```

## Expected Behavior

When fixed, migrations should run in any environment:

```bash
$ NODE_ENV=development node src/migrate.js status
✓ Connected to database: localhost:5432/myapp_dev
✓ Migrations table exists

Pending migrations:
  - 001_create_users.js
  - 002_add_email_index.js

$ NODE_ENV=production DB_SSL=true node src/migrate.js up
✓ Connected to database (SSL): prod-db.example.com:5432/myapp
✓ Running 2 pending migrations...
  ✓ 001_create_users.js (23ms)
  ✓ 002_add_email_index.js (15ms)

All migrations complete!
```

## Project Structure

```
src/
├── migrate.js         # CLI entry point
├── config/
│   ├── loader.js      # Config file loader
│   ├── validator.js   # Config validation
│   └── defaults.js    # Default values
├── services/
│   ├── database.js    # Database connection
│   └── migrator.js    # Migration runner
└── migrations/        # Migration files
config/
├── default.json       # Base config
├── development.json   # Dev overrides
└── production.json    # Prod overrides
.env.example           # Environment variables template
```

## Difficulty

⭐⭐⭐ (Intermediate-Advanced) - Requires understanding of Node.js config patterns, environment variables, and file path resolution.

## What Makes This Realistic

Configuration bugs are extremely common in Node.js applications:
- dotenv not loaded early enough
- Path resolution differs between dev and production
- Environment variable type coercion issues
- Config merge order problems
