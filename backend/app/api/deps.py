"""FastAPI dependency providers.

Services are constructed per-request from the request-scoped DB session.
"""
from collections.abc import Iterator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_session
from app.models.user import User
from app.services.auth_service import AuthService
from app.services.customer_service import CustomerService
from app.services.dashboard_service import DashboardService
from app.services.order_service import OrderService
from app.services.product_service import ProductService

# Reads the "Authorization: Bearer <token>" header (and powers Swagger's
# Authorize button).
bearer_scheme = HTTPBearer(auto_error=True)


def get_db() -> Iterator[Session]:
    yield from get_session()


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(db)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Validate the bearer token and return the authenticated user."""
    email = decode_access_token(credentials.credentials)
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = AuthService(db).get_by_email(email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_product_service(db: Session = Depends(get_db)) -> ProductService:
    return ProductService(db)


def get_customer_service(db: Session = Depends(get_db)) -> CustomerService:
    return CustomerService(db)


def get_order_service(db: Session = Depends(get_db)) -> OrderService:
    return OrderService(db)


def get_dashboard_service(db: Session = Depends(get_db)) -> DashboardService:
    return DashboardService(db)
