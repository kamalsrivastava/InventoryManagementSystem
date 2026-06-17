"""Customer endpoints."""
from fastapi import APIRouter, Depends, status

from app.api.deps import get_customer_service
from app.schemas.customer import CustomerCreate, CustomerRead
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/customers", tags=["customers"])


@router.post("", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
def create_customer(
    payload: CustomerCreate, service: CustomerService = Depends(get_customer_service)
):
    return service.create(payload)


@router.get("", response_model=list[CustomerRead])
def list_customers(service: CustomerService = Depends(get_customer_service)):
    return service.list()


@router.get("/{customer_id}", response_model=CustomerRead)
def get_customer(
    customer_id: int, service: CustomerService = Depends(get_customer_service)
):
    return service.get(customer_id)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: int, service: CustomerService = Depends(get_customer_service)
):
    service.delete(customer_id)
