"""FastAPI application factory and entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.error_handlers import register_exception_handlers
from app.api.router import api_router
from app.api.routes import health
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("inventory")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.project_name,
        version=settings.version,
        description="Manage products, customers, orders and inventory tracking.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)

    app.include_router(health.router)
    app.include_router(api_router)

    logger.info("Application initialised (environment=%s)", settings.environment)
    return app


app = create_app()
