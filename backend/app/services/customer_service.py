"""Customer business logic."""
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.customer import Customer
from app.repositories.customer import CustomerRepository
from app.schemas.customer import CustomerCreate


class CustomerService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = CustomerRepository(session)

    def get(self, customer_id: int) -> Customer:
        customer = self.repo.get(customer_id)
        if customer is None:
            raise NotFoundError(f"Customer {customer_id} not found")
        return customer

    def list(self) -> list[Customer]:
        return self.repo.list()

    def create(self, data: CustomerCreate) -> Customer:
        if self.repo.get_by_email(data.email):
            raise ConflictError(f"A customer with email '{data.email}' already exists")
        customer = Customer(**data.model_dump())
        try:
            self.repo.add(customer)
            self.session.commit()
        except IntegrityError:
            self.session.rollback()
            raise ConflictError(f"A customer with email '{data.email}' already exists")
        self.session.refresh(customer)
        return customer

    def delete(self, customer_id: int) -> None:
        customer = self.get(customer_id)
        try:
            self.repo.delete(customer)
            self.session.commit()
        except IntegrityError:
            self.session.rollback()
            raise ConflictError("Cannot delete a customer with existing orders")
