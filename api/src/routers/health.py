from fastapi import APIRouter
from src.config.settings import settings

router = APIRouter(prefix="/health", tags=["Diagnostics"])


@router.get("/")
def read_health() -> dict[str, str]:
    """Health check endpoint to verify API operational status."""
    return {"status": "healthy", "message": f"Welcome to {settings.api_title}"}
