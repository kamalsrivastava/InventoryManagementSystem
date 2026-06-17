"""Product business logic."""
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.models.product import Product
from app.repositories.product import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = ProductRepository(session)

    def get(self, product_id: int) -> Product:
        product = self.repo.get(product_id)
        if product is None:
            raise NotFoundError(f"Product {product_id} not found")
        return product

    def list(self) -> list[Product]:
        return self.repo.list()

    def create(self, data: ProductCreate) -> Product:
        if self.repo.get_by_sku(data.sku):
            raise ConflictError(f"A product with SKU '{data.sku}' already exists")
        product = Product(**data.model_dump())
        try:
            self.repo.add(product)
            self.session.commit()
        except IntegrityError:
            self.session.rollback()
            raise ConflictError(f"A product with SKU '{data.sku}' already exists")
        self.session.refresh(product)
        return product

    def update(self, product_id: int, data: ProductUpdate) -> Product:
        product = self.get(product_id)
        updates = data.model_dump(exclude_unset=True)
        if not updates:
            raise ValidationError("No fields provided to update")

        new_sku = updates.get("sku")
        if new_sku and new_sku != product.sku and self.repo.get_by_sku(new_sku):
            raise ConflictError(f"A product with SKU '{new_sku}' already exists")

        for field, value in updates.items():
            setattr(product, field, value)
        try:
            self.session.commit()
        except IntegrityError:
            self.session.rollback()
            raise ConflictError(f"A product with SKU '{new_sku}' already exists")
        self.session.refresh(product)
        return product

    def delete(self, product_id: int) -> None:
        product = self.get(product_id)
        try:
            self.repo.delete(product)
            self.session.commit()
        except IntegrityError:
            self.session.rollback()
            raise ConflictError("Cannot delete a product referenced by existing orders")
