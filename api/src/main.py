from fastapi import APIRouter, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
from collections import defaultdict
from src.config.settings import settings
from src.routers import health, score_submissions, avatar_uploads

# Simple in-memory rate limiting to prevent DoS (100 requests / minute)
rate_limit_records = defaultdict(list)
RATE_LIMIT = 100

class RouterRegistry:
    """OOP Registry responsible for consolidating and attaching API routers."""

    routers = (health.router, avatar_uploads.router, score_submissions.router)

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

    @app.middleware("http")
    async def rate_limit_middleware(request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Clean up records older than 60 seconds
        rate_limit_records[client_ip] = [t for t in rate_limit_records[client_ip] if now - t < 60]
        
        if len(rate_limit_records[client_ip]) >= RATE_LIMIT:
            return JSONResponse(status_code=429, content={"detail": "Too Many Requests"})
            
        rate_limit_records[client_ip].append(now)
        return await call_next(request)

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
