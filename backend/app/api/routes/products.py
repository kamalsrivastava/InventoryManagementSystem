"""Product endpoints."""
from fastapi import APIRouter, Depends, status

from app.api.deps import get_current_user, get_product_service
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["products"])

# Applied to mutating routes: requires a valid bearer token.
auth_required = [Depends(get_current_user)]


@router.post(
    "",
    response_model=ProductRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=auth_required,
)
def create_product(
    payload: ProductCreate, service: ProductService = Depends(get_product_service)
):
    return service.create(payload)


@router.get("", response_model=list[ProductRead])
def list_products(service: ProductService = Depends(get_product_service)):
    return service.list()


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, service: ProductService = Depends(get_product_service)):
    return service.get(product_id)


@router.put("/{product_id}", response_model=ProductRead, dependencies=auth_required)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    service: ProductService = Depends(get_product_service),
):
    return service.update(product_id, payload)


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=auth_required,
)
def delete_product(product_id: int, service: ProductService = Depends(get_product_service)):
    service.delete(product_id)
