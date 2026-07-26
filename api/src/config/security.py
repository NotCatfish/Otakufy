import time
from fastapi import Header, HTTPException, Request, Depends


class RateLimiter:
    """OOP Token-Bucket / Window Rate Limiter Dependency."""

    def __init__(self, seconds: int, detail: str = "Rate limit exceeded. Please wait."):
        self.seconds = seconds
        self.detail = detail
        self.db: dict[str, float] = {}

    def __call__(self, request: Request):
        client_ip = request.client.host
        now = time.time()
        
        # Prevent memory leaks by pruning the oldest entries when the store gets too large
        if len(self.db) > 1000:
            keys_to_delete = list(self.db.keys())[:200]
            for k in keys_to_delete:
                self.db.pop(k, None)

        if now - self.db.get(client_ip, 0) < self.seconds:
            raise HTTPException(status_code=429, detail=self.detail)
        self.db[client_ip] = now

    def clear(self):
        """Reset rate limiter store (useful for testing)."""
        self.db.clear()


# Reusable instances for routers
submission_rate_limiter = RateLimiter(seconds=5, detail="Rate limit exceeded. Please wait.")
upload_rate_limiter = RateLimiter(seconds=10, detail="Too many requests. Please wait.")


def verify_csrf_token(
    request: Request,
    x_requested_with: str | None = Header(default=None, alias="X-Requested-With"),
    x_client_info: str | None = Header(default=None, alias="X-Client-Info"),
    authorization: str | None = Header(default=None)
) -> bool:
    """
    Genuine Anti-CSRF defense:
    Cross-origin browser forms (<form method="POST">) cannot set custom headers
    like X-Requested-With or Authorization without passing CORS preflight checks.
    """
    if not (x_requested_with or x_client_info or authorization):
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Missing custom client headers required for Anti-CSRF protection."
        )
    return True


def extract_unverified_jwt_token(authorization: str = Header(...)) -> str:
    """
    Extracts the JWT Bearer Token from the header.
    WARNING: This does NOT cryptographically verify the signature. 
    It only ensures the structural format is correct before passing it to Supabase.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format. Expected Bearer token.")
    token = authorization.split("Bearer ")[-1].strip()
    if len(token.split(".")) != 3:
        raise HTTPException(status_code=401, detail="Malformed JWT token structure.")
    return token


def get_secure_deps(rate_limiter: RateLimiter) -> list:
    """Helper to return the standard array of security dependencies for routers."""
    return [
        Depends(verify_csrf_token),
        Depends(extract_unverified_jwt_token),
        Depends(rate_limiter),
    ]
