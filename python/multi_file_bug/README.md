# Bookstore API - Multi-File / Cross-Layer Bug

## Difficulty: ⭐⭐⭐⭐
## Pillar: Multi-File / Cross-Layer Bugs

## What This Project Does (When Fixed)

A REST API for a bookstore that provides:
- Book inventory management (CRUD operations)
- Author information and relationships
- Search functionality with filters
- Inventory tracking with low-stock alerts

## Symptoms

When you run the API and make requests:
- Some endpoints return 500 errors
- Data returned doesn't match what was sent
- Search returns unexpected results
- Frontend expectations don't match backend responses

Example failures:
```
GET /api/books/1 → 500 Internal Server Error
POST /api/books → Returns malformed response
GET /api/books?author=King → Returns empty array (should find books)
GET /api/inventory/low-stock → Returns wrong threshold items
```

## Expected Success State

```bash
# Start the server
python app.py

# All these should work:
curl http://localhost:5000/api/books
# → {"books": [...], "total": 5, "page": 1}

curl http://localhost:5000/api/books/1
# → {"id": 1, "title": "...", "author": {...}, "price": 19.99}

curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title": "New Book", "author_id": 1, "price": 24.99}'
# → {"id": 6, "title": "New Book", ...}

curl "http://localhost:5000/api/books?author=Stephen"
# → {"books": [{"title": "The Shining", ...}], "total": 1}

curl http://localhost:5000/api/inventory/low-stock
# → {"items": [...], "threshold": 10}
```

## How to Verify Success

```bash
pip install flask
python app.py
# Then run the curl commands above
```

Alternatively, run the included integration tests:
```bash
python test_api.py
```

## What Makes This Realistic

- **Schema mismatch**: Frontend expects `authorName`, backend sends `author.name`
- **Type inconsistency**: IDs are strings in some places, integers in others  
- **Contract drift**: API documentation says one thing, implementation does another
- **Query parameter handling**: Search params processed differently than expected
- **Nested object serialization**: Related objects not properly included

These bugs require tracing data flow across:
- Route handlers (app.py)
- Data models (models.py)
- Serialization layer (schemas.py)
- Data access layer (repository.py)

## Files

- `app.py` - Flask routes and handlers
- `models.py` - Data models
- `schemas.py` - Request/Response serialization
- `repository.py` - Data access layer
- `database.py` - Mock database
- `test_api.py` - Integration tests
