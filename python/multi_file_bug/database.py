"""
Mock database initialization with sample data.
"""
from models import Book, Author
from repository import BookRepository, AuthorRepository


def init_database(book_repo: BookRepository, author_repo: AuthorRepository) -> None:
    """
    Initialize the database with sample data.
    
    Args:
        book_repo: Book repository instance
        author_repo: Author repository instance
    """
    # Create authors
    authors = [
        Author(id=0, name="Stephen King", bio="Master of horror fiction"),
        Author(id=0, name="J.K. Rowling", bio="Creator of Harry Potter"),
        Author(id=0, name="George Orwell", bio="Author of 1984 and Animal Farm"),
        Author(id=0, name="Jane Austen", bio="Classic English novelist"),
    ]
    
    for author in authors:
        author_repo.create(author)
    
    # Create books
    books = [
        Book(
            id=0,
            title="The Shining",
            author_id=1,
            price=14.99,
            isbn="978-0307743657",
            description="A family heads to an isolated hotel for the winter",
            stock=25
        ),
        Book(
            id=0,
            title="It",
            author_id=1,
            price=18.99,
            isbn="978-1501142970",
            description="Seven friends face their fears",
            stock=8  # Low stock
        ),
        Book(
            id=0,
            title="Harry Potter and the Sorcerer's Stone",
            author_id=2,
            price=12.99,
            isbn="978-0590353427",
            description="A young wizard discovers his heritage",
            stock=50
        ),
        Book(
            id=0,
            title="1984",
            author_id=3,
            price=9.99,
            isbn="978-0451524935",
            description="A dystopian social science fiction novel",
            stock=5  # Low stock
        ),
        Book(
            id=0,
            title="Pride and Prejudice",
            author_id=4,
            price=7.99,
            isbn="978-0141439518",
            description="A romantic novel of manners",
            stock=15
        ),
    ]
    
    for book in books:
        book_repo.create(book)
    
    print(f"Initialized database with {len(authors)} authors and {len(books)} books")
