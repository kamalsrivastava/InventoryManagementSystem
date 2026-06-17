"""Database engine and session management."""
from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

# pool_pre_ping recycles dead connections (e.g. after the DB container restarts).
engine = create_engine(settings.database_url, pool_pre_ping=True, future=True)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)


def get_session() -> Iterator[Session]:
    """Yield a request-scoped session and guarantee it is closed."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
