"""
Integration tests for the Bookstore API.

These tests verify the API contract that frontend expects.
"""
import json
import unittest
from app import app


class TestBookstoreAPI(unittest.TestCase):
    """Integration tests for the Bookstore API."""
    
    def setUp(self):
        """Set up test client."""
        self.client = app.test_client()
        app.testing = True
    
    # ==================== Book Endpoints ====================
    
    def test_get_all_books(self):
        """GET /api/books should return paginated book list."""
        response = self.client.get('/api/books')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIn('books', data)
        self.assertIn('total', data)
        self.assertIsInstance(data['books'], list)
    
    def test_get_single_book(self):
        """GET /api/books/<id> should return a single book."""
        response = self.client.get('/api/books/1')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIn('id', data)
        self.assertIn('title', data)
        self.assertIn('price', data)
    
    def test_get_nonexistent_book(self):
        """GET /api/books/<id> should return 404 for missing book."""
        response = self.client.get('/api/books/9999')
        self.assertEqual(response.status_code, 404)
    
    def test_filter_books_by_author(self):
        """GET /api/books?author=X should filter by author name."""
        response = self.client.get('/api/books?author=Stephen')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertGreater(len(data['books']), 0, "Should find Stephen King books")
    
    def test_create_book(self):
        """POST /api/books should create a new book."""
        new_book = {
            'title': 'Test Book',
            'author_id': 1,
            'price': 19.99
        }
        
        response = self.client.post(
            '/api/books',
            data=json.dumps(new_book),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        
        data = json.loads(response.data)
        # Frontend expects the book directly, not wrapped in 'book' key
        self.assertIn('id', data)
        self.assertEqual(data['title'], 'Test Book')
    
    def test_create_book_missing_fields(self):
        """POST /api/books should return 400 for missing required fields."""
        incomplete_book = {'title': 'Test'}
        
        response = self.client.post(
            '/api/books',
            data=json.dumps(incomplete_book),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
    
    def test_update_book(self):
        """PUT /api/books/<id> should update book."""
        update_data = {'price': 24.99}
        
        response = self.client.put(
            '/api/books/1',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['price'], 24.99)
    
    def test_delete_book(self):
        """DELETE /api/books/<id> should delete book."""
        # First create a book to delete
        new_book = {
            'title': 'To Delete',
            'author_id': 1,
            'price': 9.99
        }
        
        create_response = self.client.post(
            '/api/books',
            data=json.dumps(new_book),
            content_type='application/json'
        )
        
        # Extract ID (handle both response formats)
        data = json.loads(create_response.data)
        book_id = data.get('id') or data.get('book', {}).get('id')
        
        # Delete the book
        delete_response = self.client.delete(f'/api/books/{book_id}')
        self.assertEqual(delete_response.status_code, 204)
        
        # Verify it's gone
        get_response = self.client.get(f'/api/books/{book_id}')
        self.assertEqual(get_response.status_code, 404)
    
    # ==================== Author Endpoints ====================
    
    def test_get_all_authors(self):
        """GET /api/authors should return all authors."""
        response = self.client.get('/api/authors')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIn('authors', data)
        self.assertGreater(len(data['authors']), 0)
    
    def test_get_single_author(self):
        """GET /api/authors/<id> should return author with books."""
        response = self.client.get('/api/authors/1')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIn('name', data)
        self.assertIn('books', data)
    
    # ==================== Inventory Endpoints ====================
    
    def test_get_low_stock(self):
        """GET /api/inventory/low-stock should return low inventory books."""
        response = self.client.get('/api/inventory/low-stock?threshold=10')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIn('items', data)
        self.assertIn('threshold', data)
        
        # All items should have stock < threshold
        for item in data['items']:
            self.assertLess(
                item['stock'], 
                data['threshold'],
                f"Book {item['title']} has stock {item['stock']} >= threshold {data['threshold']}"
            )
    
    def test_update_inventory(self):
        """PATCH /api/inventory/<id> should update stock."""
        update_data = {'stock': 100}
        
        response = self.client.patch(
            '/api/inventory/1',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['stock'], 100)


if __name__ == '__main__':
    unittest.main()
