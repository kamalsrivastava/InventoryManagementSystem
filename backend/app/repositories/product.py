"""Product data access."""
from sqlalchemy import select

from app.models.product import Product
from app.repositories.base import BaseRepository


class ProductRepository(BaseRepository[Product]):
    model = Product

    def get_by_sku(self, sku: str) -> Product | None:
        return self.session.scalar(select(Product).where(Product.sku == sku))

    def list_low_stock(self, threshold: int) -> list[Product]:
        stmt = (
            select(Product)
            .where(Product.quantity <= threshold)
            .order_by(Product.quantity.asc())
        )
        return list(self.session.scalars(stmt).all())

    def get_many_for_update(self, ids: list[int]) -> dict[int, Product]:
        """Fetch products with a row-level lock (SELECT ... FOR UPDATE).

        Prevents two concurrent orders from overselling the same stock.
        """
        stmt = select(Product).where(Product.id.in_(ids)).with_for_update()
        return {p.id: p for p in self.session.scalars(stmt).all()}
