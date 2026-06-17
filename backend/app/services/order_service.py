"""Order business logic — the heart of the system.

Rules enforced here:
  * the customer and every product referenced must exist,
  * an order cannot be placed if stock is insufficient,
  * placing an order atomically decrements stock,
  * the total is computed from current product prices (never trusted from the
    client),
  * cancelling an order restocks its products.
"""
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.exceptions import InsufficientStockError, NotFoundError
from app.models.order import Order, OrderItem
from app.repositories.customer import CustomerRepository
from app.repositories.order import OrderRepository
from app.repositories.product import ProductRepository
from app.schemas.order import OrderCreate, OrderDetail, OrderItemDetail


class OrderService:
    def __init__(self, session: Session):
        self.session = session
        self.orders = OrderRepository(session)
        self.products = ProductRepository(session)
        self.customers = CustomerRepository(session)

    def create(self, data: OrderCreate) -> Order:
        customer = self.customers.get(data.customer_id)
        if customer is None:
            raise NotFoundError(f"Customer {data.customer_id} not found")

        # Aggregate duplicate product lines so stock is checked in total.
        requested: dict[int, int] = {}
        for item in data.items:
            requested[item.product_id] = requested.get(item.product_id, 0) + item.quantity

        # Lock the product rows for the duration of the transaction.
        locked = self.products.get_many_for_update(list(requested.keys()))

        order = Order(customer_id=customer.id, total_amount=Decimal("0"))
        total = Decimal("0")
        for product_id, qty in requested.items():
            product = locked.get(product_id)
            if product is None:
                self.session.rollback()
                raise NotFoundError(f"Product {product_id} not found")
            if product.quantity < qty:
                self.session.rollback()
                raise InsufficientStockError(
                    f"Insufficient stock for '{product.name}': "
                    f"requested {qty}, available {product.quantity}"
                )
            product.quantity -= qty
            unit_price = Decimal(product.price)
            total += unit_price * qty
            order.items.append(
                OrderItem(product_id=product.id, quantity=qty, unit_price=unit_price)
            )

        order.total_amount = total
        self.orders.add(order)
        self.session.commit()
        return self.orders.get_with_details(order.id)

    def list(self) -> list[Order]:
        return self.orders.list_with_items()

    def get_detail(self, order_id: int) -> Order:
        order = self.orders.get_with_details(order_id)
        if order is None:
            raise NotFoundError(f"Order {order_id} not found")
        return order

    def cancel(self, order_id: int) -> None:
        order = self.get_detail(order_id)
        # Return reserved stock to inventory before deleting the order.
        for item in order.items:
            product = self.products.get(item.product_id)
            if product is not None:
                product.quantity += item.quantity
        self.orders.delete(order)
        self.session.commit()


def to_detail(order: Order) -> OrderDetail:
    """Map an ORM order (with relationships loaded) to the detail schema."""
    items = [
        OrderItemDetail(
            id=item.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            product_name=item.product.name if item.product else "(deleted product)",
            line_total=Decimal(item.unit_price) * item.quantity,
        )
        for item in order.items
    ]
    return OrderDetail(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.full_name if order.customer else "(deleted customer)",
        total_amount=order.total_amount,
        status=order.status,
        created_at=order.created_at,
        items=items,
    )
