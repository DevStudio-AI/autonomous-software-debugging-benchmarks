# File Format Validator

## Difficulty: ⭐⭐
## Pillar: Static + Structural

A Node.js utility for validating various file formats (JSON, CSV, XML, YAML).

## The Bug

The project contains bugs that cause the symptoms described below. The debugging system must identify and fix these issues.
- Incorrect relative import paths (`../utils` instead of `./utils`)
- Circular dependency between `models` and `services`  
- Missing file extension in ESM imports
- Wrong module export style mixing (CommonJS vs ESM)

## Symptoms

```bash
$ node src/index.js

Error: Cannot find module '../utils/parser'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1144:15)
```

Or:

```bash
Error [ERR_REQUIRE_CYCLE]: Circular dependency detected
```

## Expected Behavior

When fixed, running the validator should work:

```bash
$ node src/index.js sample.json

✓ Validating: sample.json
✓ Format: JSON
✓ Schema: Valid
✓ 3 records found

Validation complete!
```

## Project Structure

```
src/
├── index.js          # Entry point
├── validator.js      # Main validation orchestrator
├── utils/
│   ├── parser.js     # File parsing utilities
│   └── logger.js     # Logging utility
├── services/
│   ├── jsonService.js
│   ├── csvService.js
│   └── schemaService.js
└── models/
    ├── record.js
    └── validationResult.js
```

## Difficulty

⭐⭐ (Intermediate) - Requires understanding of Node.js module resolution and import/export patterns.

## What Makes This Realistic

Import path errors are among the most common issues in JavaScript projects, especially when:
- Refactoring directory structure
- Converting between CommonJS and ESM
- Working across different module systems
- Copy-pasting code between files without updating paths
