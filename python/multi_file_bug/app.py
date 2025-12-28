"""
Bookstore API - Flask application with REST endpoints.
"""
from flask import Flask, request, jsonify
from models import Book, Author
from schemas import BookSchema, AuthorSchema, BookListSchema
from repository import BookRepository, AuthorRepository
from database import init_database

app = Flask(__name__)

# Initialize repositories
book_repo = BookRepository()
author_repo = AuthorRepository()

# Initialize mock database
init_database(book_repo, author_repo)


# ==================== Book Endpoints ====================

@app.route('/api/books', methods=['GET'])
def get_books():
    """
    Get all books with optional filtering.
    
    Query params:
        author: Filter by author name (partial match)
        min_price: Minimum price filter
        max_price: Maximum price filter
        page: Page number (default 1)
        per_page: Items per page (default 10)
    """
    # Get query parameters
    author_filter = request.args.get('author')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Fetch books
    books = book_repo.get_all()
    
    # Apply filters
    if author_filter:
        books = [b for b in books if author_filter.lower() in b.author_name.lower()]
    
    if min_price is not None:
        books = [b for b in books if b.price >= min_price]
    
    if max_price is not None:
        books = [b for b in books if b.price <= max_price]
    
    # Pagination
    total = len(books)
    start = (page - 1) * per_page
    end = start + per_page
    paginated_books = books[start:end]
    
    # Serialize response
    schema = BookListSchema()
    return jsonify(schema.dump(paginated_books, total, page))


@app.route('/api/books/<book_id>', methods=['GET'])
def get_book(book_id):
    """Get a single book by ID."""
    book = book_repo.get_by_id(book_id)
    
    if not book:
        return jsonify({'error': 'Book not found'}), 404
    
    schema = BookSchema()
    return jsonify(schema.dump(book))


@app.route('/api/books', methods=['POST'])
def create_book():
    """Create a new book."""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate required fields
    required = ['title', 'author_id', 'price']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Create book
    schema = BookSchema()
    book = schema.load(data)
    
    saved_book = book_repo.create(book)
    
    return jsonify({'book': schema.dump(saved_book)}), 201


@app.route('/api/books/<book_id>', methods=['PUT'])
def update_book(book_id):
    """Update an existing book."""
    data = request.get_json()
    
    book = book_repo.get_by_id(int(book_id))
    if not book:
        return jsonify({'error': 'Book not found'}), 404
    
    # Update fields
    if 'title' in data:
        book.title = data['title']
    if 'price' in data:
        book.price = data['price']
    if 'author_id' in data:
        book.author_id = data['author_id']
    
    updated_book = book_repo.update(book)
    
    schema = BookSchema()
    return jsonify(schema.dump(updated_book))


@app.route('/api/books/<book_id>', methods=['DELETE'])
def delete_book(book_id):
    """Delete a book."""
    success = book_repo.delete(int(book_id))
    
    if not success:
        return jsonify({'error': 'Book not found'}), 404
    
    return '', 204


# ==================== Author Endpoints ====================

@app.route('/api/authors', methods=['GET'])
def get_authors():
    """Get all authors."""
    authors = author_repo.get_all()
    schema = AuthorSchema()
    return jsonify({'authors': [schema.dump(a) for a in authors]})


@app.route('/api/authors/<author_id>', methods=['GET'])
def get_author(author_id):
    """Get a single author with their books."""
    author = author_repo.get_by_id(int(author_id))
    
    if not author:
        return jsonify({'error': 'Author not found'}), 404
    
    # Get author's books
    books = book_repo.get_by_author(author.id)
    
    schema = AuthorSchema()
    result = schema.dump(author)
    result['books'] = [{'id': b.id, 'title': b.title} for b in books]
    
    return jsonify(result)


# ==================== Inventory Endpoints ====================

@app.route('/api/inventory/low-stock', methods=['GET'])
def get_low_stock():
    """Get books with low inventory."""
    threshold = request.args.get('threshold', 10, type=int)
    
    books = book_repo.get_all()
    low_stock = [b for b in books if b.stock >= threshold]
    
    schema = BookSchema()
    return jsonify({
        'items': [schema.dump(b) for b in low_stock],
        'threshold': threshold
    })


@app.route('/api/inventory/<book_id>', methods=['PATCH'])
def update_inventory(book_id):
    """Update book inventory."""
    data = request.get_json()
    
    book = book_repo.get_by_id(int(book_id))
    if not book:
        return jsonify({'error': 'Book not found'}), 404
    
    if 'stock' in data:
        book.stock = data['stock']
        book_repo.update(book)
    
    return jsonify({'id': book.id, 'stock': book.stock})


# ==================== Error Handlers ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    print("Starting Bookstore API on http://localhost:5000")
    app.run(debug=True, port=5000)
