"""
Request/Response schemas for serialization.
"""
from typing import Dict, Any, List, Optional
from models import Book, Author


class AuthorSchema:
    """Schema for Author serialization."""
    
    def dump(self, author: Author) -> Dict[str, Any]:
        """Serialize an Author to dictionary."""
        return {
            'id': author.id,
            'name': author.name,
            'bio': author.bio
        }
    
    def load(self, data: Dict[str, Any]) -> Author:
        """Deserialize dictionary to Author."""
        return Author(
            id=data.get('id', 0),
            name=data['name'],
            bio=data.get('bio', '')
        )


class BookSchema:
    """Schema for Book serialization."""
    
    def __init__(self, include_author: bool = True):
        self.include_author = include_author
        self._author_cache = {}
    
    def set_author_cache(self, authors: Dict[int, Author]):
        """Set author lookup cache."""
        self._author_cache = authors
    
    def dump(self, book: Book) -> Dict[str, Any]:
        """
        Serialize a Book to dictionary.
        
        but this returns nested 'author' object.
        Also, frontend expects 'id' as string, this returns int.
        """
        result = {
            'id': book.id,
            'title': book.title,
            'price': book.price,
            'isbn': book.isbn,
            'description': book.description,
            'stock': book.stock,
            'author_id': book.author_id
        }
        
        if self.include_author and book.author_id in self._author_cache:
            author = self._author_cache[book.author_id]
            result['author'] = {
                'id': author.id,
                'name': author.name
            }
        
        return result
    
    def load(self, data: Dict[str, Any]) -> Book:
        """
        Deserialize dictionary to Book.
        
        """
        return Book(
            id=data.get('id', 0),
            title=data['title'],
            author_id=data['author_id'],
            price=float(data['price']),
            isbn=data.get('isbn', ''),
            description=data.get('description', ''),
            stock=data.get('stock', 0)
        )


class BookListSchema:
    """Schema for paginated book list."""
    
    def __init__(self):
        self.book_schema = BookSchema()
    
    def dump(self, books: List[Book], total: int, page: int) -> Dict[str, Any]:
        """
        Serialize a list of books with pagination info.
        
        """
        return {
            'books': [self.book_schema.dump(b) for b in books],
            'total': total,
            'page': page
        }
