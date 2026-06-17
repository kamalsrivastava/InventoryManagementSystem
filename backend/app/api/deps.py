"""FastAPI dependency providers.

Services are constructed per-request from the request-scoped DB session.
"""
from collections.abc import Iterator

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_session
from app.services.customer_service import CustomerService
from app.services.dashboard_service import DashboardService
from app.services.order_service import OrderService
from app.services.product_service import ProductService


def get_db() -> Iterator[Session]:
    yield from get_session()


def get_product_service(db: Session = Depends(get_db)) -> ProductService:
    return ProductService(db)


def get_customer_service(db: Session = Depends(get_db)) -> CustomerService:
    return CustomerService(db)


def get_order_service(db: Session = Depends(get_db)) -> OrderService:
    return OrderService(db)


def get_dashboard_service(db: Session = Depends(get_db)) -> DashboardService:
    return DashboardService(db)
