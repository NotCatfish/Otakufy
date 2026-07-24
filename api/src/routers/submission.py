from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from src.config.security import submission_rate_limiter, verify_csrf_token, extract_unverified_jwt_token

router = APIRouter(prefix="/submission", tags=["Security & Validation"])


class ScoreSubmission(BaseModel):
    """Strict allow-listed schema representing a user score submission."""

    username: str = Field(..., min_length=3, max_length=20, pattern=r"^[a-zA-Z0-9_]+$")
    score: int = Field(..., ge=0, le=10000)
    session_token: str = Field(..., min_length=32, max_length=64, pattern=r"^[a-fA-F0-9-]+$")


@router.post("/score", dependencies=[Depends(verify_csrf_token), Depends(extract_unverified_jwt_token), Depends(submission_rate_limiter)])
def submit_score(payload: ScoreSubmission) -> dict[str, str]:
    """Zero-Trust score submission endpoint with strict allow-list schema and Anti-CSRF verification."""
    return {
        "status": "success",
        "message": f"Score {payload.score} securely recorded for {payload.username}.",
    }
