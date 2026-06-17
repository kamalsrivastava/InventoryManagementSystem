"""Database engine, session factory, and FastAPI dependency."""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

# pool_pre_ping recycles dead connections (useful when the DB container
# restarts independently of the backend).
engine = create_engine(settings.database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()


def get_db():
    """Yield a request-scoped DB session and always close it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
