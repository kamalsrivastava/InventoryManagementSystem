"""Pydantic schemas package."""
from app.schemas.customer import CustomerCreate, CustomerRead
from app.schemas.dashboard import DashboardSummary
from app.schemas.order import (
    OrderCreate,
    OrderDetail,
    OrderItemCreate,
    OrderItemDetail,
    OrderItemRead,
    OrderRead,
)
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate

__all__ = [
    "CustomerCreate",
    "CustomerRead",
    "DashboardSummary",
    "OrderCreate",
    "OrderDetail",
    "OrderItemCreate",
    "OrderItemDetail",
    "OrderItemRead",
    "OrderRead",
    "ProductCreate",
    "ProductRead",
    "ProductUpdate",
]
