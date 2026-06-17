"""FastAPI application entry point."""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import customers, dashboard, orders, products

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("inventory")

app = FastAPI(
    title="Inventory & Order Management API",
    description="Manage products, customers, orders and inventory tracking.",
    version="1.0.0",
)

# CORS — the browser-based frontend calls this API directly.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    """Create tables on boot (simple schema management for this assessment)."""
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ensured.")


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}


app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)
