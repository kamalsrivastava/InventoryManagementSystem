"""Dashboard aggregation logic."""
from sqlalchemy.orm import Session

from app.core.config import settings
from app.repositories.customer import CustomerRepository
from app.repositories.order import OrderRepository
from app.repositories.product import ProductRepository
from app.schemas.dashboard import DashboardSummary


class DashboardService:
    def __init__(self, session: Session):
        self.products = ProductRepository(session)
        self.customers = CustomerRepository(session)
        self.orders = OrderRepository(session)

    def summary(self) -> DashboardSummary:
        low_stock = self.products.list_low_stock(settings.low_stock_threshold)
        return DashboardSummary(
            total_products=self.products.count(),
            total_customers=self.customers.count(),
            total_orders=self.orders.count(),
            low_stock_count=len(low_stock),
            low_stock_products=low_stock,
        )
