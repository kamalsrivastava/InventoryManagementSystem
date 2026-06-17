"""Order endpoints."""
from fastapi import APIRouter, Depends, status

from app.api.deps import get_order_service
from app.schemas.order import OrderCreate, OrderDetail, OrderRead
from app.services.order_service import OrderService, to_detail

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderDetail, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, service: OrderService = Depends(get_order_service)):
    return to_detail(service.create(payload))


@router.get("", response_model=list[OrderRead])
def list_orders(service: OrderService = Depends(get_order_service)):
    return service.list()


@router.get("/{order_id}", response_model=OrderDetail)
def get_order(order_id: int, service: OrderService = Depends(get_order_service)):
    return to_detail(service.get_detail(order_id))


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_order(order_id: int, service: OrderService = Depends(get_order_service)):
    service.cancel(order_id)
