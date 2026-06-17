"""Repository (data-access) package."""
from app.repositories.customer import CustomerRepository
from app.repositories.order import OrderRepository
from app.repositories.product import ProductRepository
from app.repositories.user import UserRepository

__all__ = [
    "ProductRepository",
    "CustomerRepository",
    "OrderRepository",
    "UserRepository",
]
