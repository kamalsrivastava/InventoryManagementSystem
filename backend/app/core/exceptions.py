"""Domain-level exceptions.

Services raise these framework-agnostic errors; the API layer translates them
into HTTP responses (see app.api.error_handlers). This keeps business logic
decoupled from FastAPI/HTTP concerns.
"""
from fastapi import status


class DomainError(Exception):
    """Base class for expected, client-facing domain errors."""

    status_code: int = status.HTTP_400_BAD_REQUEST

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class NotFoundError(DomainError):
    status_code = status.HTTP_404_NOT_FOUND


class ConflictError(DomainError):
    """Unique-constraint violation (duplicate SKU / email, etc.)."""

    status_code = status.HTTP_409_CONFLICT


class InsufficientStockError(DomainError):
    """Requested order quantity exceeds available stock."""

    status_code = status.HTTP_409_CONFLICT


class ValidationError(DomainError):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
