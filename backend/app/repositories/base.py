"""Generic repository with common CRUD primitives."""
from typing import Generic, TypeVar

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.base_class import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    """Thin data-access wrapper around a single ORM model.

    Repositories never commit — the service layer owns transaction
    boundaries so that multi-step operations stay atomic.
    """

    model: type[ModelT]

    def __init__(self, session: Session):
        self.session = session

    def get(self, entity_id: int) -> ModelT | None:
        return self.session.get(self.model, entity_id)

    def list(self) -> list[ModelT]:
        stmt = select(self.model).order_by(self.model.id)
        return list(self.session.scalars(stmt).all())

    def count(self) -> int:
        return self.session.scalar(select(func.count()).select_from(self.model)) or 0

    def add(self, entity: ModelT) -> ModelT:
        self.session.add(entity)
        self.session.flush()  # assign PK / surface constraint errors early
        return entity

    def delete(self, entity: ModelT) -> None:
        self.session.delete(entity)
        self.session.flush()
