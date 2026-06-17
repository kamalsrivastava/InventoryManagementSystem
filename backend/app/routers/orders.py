"""Order endpoints, including the core business logic:

  * an order must reference an existing customer and existing products,
  * an order cannot be placed if stock is insufficient,
  * creating an order atomically reduces stock,
  * the total amount is computed by the backend (never trusted from client).
"""
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/orders", tags=["orders"])


def _load_order(db: Session, order_id: int) -> models.Order:
    order = (
        db.query(models.Order)
        .options(selectinload(models.Order.items).selectinload(models.OrderItem.product))
        .filter(models.Order.id == order_id)
        .first()
    )
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order {order_id} not found",
        )
    return order


def _to_detail(order: models.Order) -> schemas.OrderDetailOut:
    items = [
        schemas.OrderItemDetailOut(
            id=it.id,
            product_id=it.product_id,
            quantity=it.quantity,
            unit_price=it.unit_price,
            product_name=it.product.name if it.product else "(deleted product)",
            line_total=Decimal(it.unit_price) * it.quantity,
        )
        for it in order.items
    ]
    return schemas.OrderDetailOut(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.full_name if order.customer else "(deleted customer)",
        total_amount=order.total_amount,
        status=order.status,
        created_at=order.created_at,
        items=items,
    )


@router.post("", response_model=schemas.OrderDetailOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: schemas.OrderCreate, db: Session = Depends(get_db)):
    # 1. Customer must exist.
    customer = db.get(models.Customer, payload.customer_id)
    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer {payload.customer_id} not found",
        )

    # 2. Merge duplicate product lines so quantities are checked in aggregate.
    requested: dict[int, int] = {}
    for item in payload.items:
        requested[item.product_id] = requested.get(item.product_id, 0) + item.quantity

    # 3. Lock the product rows for the duration of the transaction to prevent
    #    two concurrent orders from overselling the same stock.
    products = (
        db.query(models.Product)
        .filter(models.Product.id.in_(requested.keys()))
        .with_for_update()
        .all()
    )
    products_by_id = {p.id: p for p in products}

    # 4. Validate existence and sufficient stock for every line.
    total = Decimal("0")
    order = models.Order(customer_id=customer.id, total_amount=Decimal("0"))
    for product_id, qty in requested.items():
        product = products_by_id.get(product_id)
        if product is None:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {product_id} not found",
            )
        if product.quantity < qty:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Insufficient stock for '{product.name}': "
                    f"requested {qty}, available {product.quantity}"
                ),
            )
        # 5. Reduce stock and accumulate the backend-computed total.
        product.quantity -= qty
        line_price = Decimal(product.price)
        total += line_price * qty
        order.items.append(
            models.OrderItem(
                product_id=product.id, quantity=qty, unit_price=line_price
            )
        )

    order.total_amount = total
    db.add(order)
    db.commit()

    # Reload with relationships eagerly populated for the response.
    return _to_detail(_load_order(db, order.id))


@router.get("", response_model=list[schemas.OrderOut])
def list_orders(db: Session = Depends(get_db)):
    return (
        db.query(models.Order)
        .options(selectinload(models.Order.items))
        .order_by(models.Order.id.desc())
        .all()
    )


@router.get("/{order_id}", response_model=schemas.OrderDetailOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    return _to_detail(_load_order(db, order_id))


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Cancel/delete an order and restock its products."""
    order = _load_order(db, order_id)
    # Return the reserved stock to inventory.
    for item in order.items:
        product = db.get(models.Product, item.product_id)
        if product is not None:
            product.quantity += item.quantity
    db.delete(order)
    db.commit()
    return None
