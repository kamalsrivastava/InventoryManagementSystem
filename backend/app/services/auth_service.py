"""Authentication business logic."""
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, DomainError
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.auth import UserCreate
from fastapi import status


class InvalidCredentialsError(DomainError):
    status_code = status.HTTP_401_UNAUTHORIZED


class AuthService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = UserRepository(session)

    def register(self, data: UserCreate) -> User:
        if self.repo.get_by_email(data.email):
            raise ConflictError(f"A user with email '{data.email}' already exists")
        user = User(email=data.email, hashed_password=hash_password(data.password))
        try:
            self.repo.add(user)
            self.session.commit()
        except IntegrityError:
            self.session.rollback()
            raise ConflictError(f"A user with email '{data.email}' already exists")
        self.session.refresh(user)
        return user

    def authenticate(self, email: str, password: str) -> str:
        user = self.repo.get_by_email(email)
        if user is None or not verify_password(password, user.hashed_password):
            raise InvalidCredentialsError("Incorrect email or password")
        return create_access_token(subject=user.email)

    def get_by_email(self, email: str) -> User | None:
        return self.repo.get_by_email(email)
