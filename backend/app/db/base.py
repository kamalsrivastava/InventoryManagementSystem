"""Import side-effect module.

Importing this pulls in every model so that ``Base.metadata`` is fully
populated. Used by Alembic's autogenerate and by the test fixtures.
"""
from app.db.base_class import Base  # noqa: F401
from app.models.customer import Customer  # noqa: F401
from app.models.order import Order, OrderItem  # noqa: F401
from app.models.product import Product  # noqa: F401
from app.models.user import User  # noqa: F401
