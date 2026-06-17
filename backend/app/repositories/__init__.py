"""Repository (data-access) package."""
from app.repositories.customer import CustomerRepository
from app.repositories.order import OrderRepository
from app.repositories.product import ProductRepository

__all__ = ["ProductRepository", "CustomerRepository", "OrderRepository"]
