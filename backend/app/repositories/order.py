"""Order data access."""
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.order import Order, OrderItem
from app.repositories.base import BaseRepository


class OrderRepository(BaseRepository[Order]):
    model = Order

    def list_with_items(self) -> list[Order]:
        stmt = (
            select(Order)
            .options(selectinload(Order.items))
            .order_by(Order.id.desc())
        )
        return list(self.session.scalars(stmt).all())

    def get_with_details(self, order_id: int) -> Order | None:
        stmt = (
            select(Order)
            .options(
                selectinload(Order.items).selectinload(OrderItem.product),
                selectinload(Order.customer),
            )
            .where(Order.id == order_id)
        )
        return self.session.scalar(stmt)
