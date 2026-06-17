"""Pytest fixtures: an isolated SQLite-backed app per test."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_db
from app.db.base import Base
from app.main import app


@pytest.fixture
def client():
    # In-memory SQLite shared across the connection pool for the test's lifetime.
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSession = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def product(client):
    resp = client.post(
        "/products",
        json={"name": "Wireless Mouse", "sku": "WM-001", "price": 20, "quantity": 5},
    )
    assert resp.status_code == 201
    return resp.json()


@pytest.fixture
def customer(client):
    resp = client.post(
        "/customers",
        json={"full_name": "Jane Doe", "email": "jane@example.com", "phone": "12345"},
    )
    assert resp.status_code == 201
    return resp.json()
