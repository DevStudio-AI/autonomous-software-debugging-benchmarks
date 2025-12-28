"""
Data access layer for the Bookstore API.
"""
from typing import List, Optional, Dict
from models import Book, Author


class BookRepository:
    """Repository for Book data access."""
    
    def __init__(self):
        self._books: Dict[int, Book] = {}
        self._next_id = 1
    
    def get_all(self) -> List[Book]:
        """Get all books."""
        return list(self._books.values())
    
    def get_by_id(self, book_id: int) -> Optional[Book]:
        """
        Get a book by ID.
        
        """
        return self._books.get(book_id)
    
    def get_by_author(self, author_id: int) -> List[Book]:
        """Get all books by an author."""
        return [b for b in self._books.values() if b.author_id == author_id]
    
    def create(self, book: Book) -> Book:
        """Create a new book."""
        book.id = self._next_id
        self._next_id += 1
        self._books[book.id] = book
        return book
    
    def update(self, book: Book) -> Book:
        """Update an existing book."""
        if book.id in self._books:
            self._books[book.id] = book
        return book
    
    def delete(self, book_id: int) -> bool:
        """Delete a book."""
        if book_id in self._books:
            del self._books[book_id]
            return True
        return False
    
    def search(self, query: str) -> List[Book]:
        """Search books by title."""
        query = query.lower()
        return [b for b in self._books.values() if query in b.title.lower()]


class AuthorRepository:
    """Repository for Author data access."""
    
    def __init__(self):
        self._authors: Dict[int, Author] = {}
        self._next_id = 1
    
    def get_all(self) -> List[Author]:
        """Get all authors."""
        return list(self._authors.values())
    
    def get_by_id(self, author_id: int) -> Optional[Author]:
        """Get an author by ID."""
        return self._authors.get(author_id)
    
    def get_by_name(self, name: str) -> Optional[Author]:
        """Get an author by name (partial match)."""
        name = name.lower()
        for author in self._authors.values():
            if name in author.name.lower():
                return author
        return None
    
    def create(self, author: Author) -> Author:
        """Create a new author."""
        author.id = self._next_id
        self._next_id += 1
        self._authors[author.id] = author
        return author
    
    def update(self, author: Author) -> Author:
        """Update an existing author."""
        if author.id in self._authors:
            self._authors[author.id] = author
        return author
    
    def delete(self, author_id: int) -> bool:
        """Delete an author."""
        if author_id in self._authors:
            del self._authors[author_id]
            return True
        return False
