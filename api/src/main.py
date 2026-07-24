from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config.settings import settings
from src.routers import health, submission, upload


class RouterRegistry:
    """OOP Registry responsible for consolidating and attaching API routers."""

    routers = (health.router, upload.router, submission.router)

    @classmethod
    def register_all(cls, app: FastAPI, prefix: str = "/api/v1") -> None:
        v1_router = APIRouter(prefix=prefix)
        for router in cls.routers:
            v1_router.include_router(router)
        app.include_router(v1_router)


def create_app() -> FastAPI:
    """Application factory initializing FastAPI, middleware, and routers."""
    app = FastAPI(
        title=settings.api_title,
        version=settings.version,
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    RouterRegistry.register_all(app)
    return app


app = create_app()
