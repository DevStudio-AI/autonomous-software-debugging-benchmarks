"""
Data models for the Bookstore API.
"""
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime


@dataclass
class Author:
    """Author model."""
    id: int
    name: str
    bio: str = ""
    created_at: datetime = field(default_factory=datetime.now)
    
    def __hash__(self):
        return hash(self.id)


@dataclass
class Book:
    """Book model."""
    id: int
    title: str
    author_id: int
    price: float
    isbn: str = ""
    description: str = ""
    stock: int = 0
    created_at: datetime = field(default_factory=datetime.now)
    
    # Note: This property doesn't exist - causes AttributeError when accessed
    # author_name would need to be populated separately via join/lookup
    
    def __hash__(self):
        return hash(self.id)
    
    @property
    def in_stock(self) -> bool:
        """Check if book is in stock."""
        return self.stock > 0


@dataclass
class Inventory:
    """Inventory tracking."""
    book_id: int
    quantity: int
    reorder_level: int = 10
    last_updated: datetime = field(default_factory=datetime.now)
    
    @property
    def needs_reorder(self) -> bool:
        """Check if reorder is needed."""
        return self.quantity <= self.reorder_level
