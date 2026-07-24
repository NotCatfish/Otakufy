import pytest
from fastapi.testclient import TestClient
import time
import sys
import os

# Add src to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.main import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_rate_limiters():
    """Ensure clean test isolation across rate-limited endpoints via OOP RateLimiter.clear()"""
    from src.config.security import submission_rate_limiter, upload_rate_limiter
    submission_rate_limiter.clear()
    upload_rate_limiter.clear()
    yield

def test_sql_injection_attempt_in_submission():
    """Test that the submission endpoint rejects SQL injection payloads due to strict regex allow-listing."""
    payload = {
        "username": "admin' OR 1=1--",
        "score": 500,
        "session_token": "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6"
    }
    response = client.post("/api/v1/submission/score", json=payload, headers={"x-csrf-token": "expected_secure_csrf_token"})
    assert response.status_code == 422
    assert "String should match pattern" in response.text

def test_xss_attempt_in_submission():
    """Test that the submission endpoint rejects XSS payloads due to strict regex allow-listing."""
    payload = {
        "username": "<script>alert(1)</script>",
        "score": 500,
        "session_token": "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6"
    }
    response = client.post("/api/v1/submission/score", json=payload, headers={"x-csrf-token": "expected_secure_csrf_token"})
    assert response.status_code == 422

def test_missing_csrf_token():
    """Test that state-changing endpoints reject requests without a valid CSRF token."""
    payload = {
        "username": "valid_user",
        "score": 500,
        "session_token": "a1b2c3d4e5f67890a1b2c3d4e5f67890"
    }
    # No header provided
    response = client.post("/api/v1/submission/score", json=payload)
    assert response.status_code == 422 # Pydantic Header requires it
    
    from src.config.security import submission_rate_limiter
    submission_rate_limiter.clear()

    # Invalid header provided
    response = client.post("/api/v1/submission/score", json=payload, headers={"x-csrf-token": "hacker_token"})
    assert response.status_code == 403
    assert response.json()["detail"] == "Invalid or missing Anti-CSRF token"

def test_secure_file_upload_spoofed_extension():
    """Test that a file with a .jpg extension but missing the magic number is rejected."""
    # Create a dummy file that is NOT a real JPEG (e.g. attempting to upload a PHP shell)
    files = {"file": ("malicious.php.jpg", b"<?php echo 'hacked'; ?>", "image/jpeg")}
    response = client.post("/api/v1/upload/avatar", files=files)
    assert response.status_code == 415
    assert "Invalid file signature" in response.text

def test_secure_file_upload_valid_magic_number():
    """Test that a valid JPEG file is accepted and renamed to UUID."""
    # Wait to bypass rate limiting from previous test if any
    time.sleep(10)
    
    # Valid JPEG magic number
    valid_jpeg_content = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00"
    files = {"file": ("avatar.jpg", valid_jpeg_content, "image/jpeg")}
    response = client.post("/api/v1/upload/avatar", files=files)
    assert response.status_code == 200
    assert "file_id" in response.json()
    assert response.json()["file_id"].endswith(".jpg")

def test_rate_limiting():
    """Test that the endpoints strictly rate-limit aggressive requests."""
    # First request
    files = {"file": ("avatar2.jpg", b"\xFF\xD8\xFF", "image/jpeg")}
    res1 = client.post("/api/v1/upload/avatar", files=files)
    
    # Second request immediately (should fail due to 10s rate limit)
    res2 = client.post("/api/v1/upload/avatar", files=files)
    assert res2.status_code == 429
    assert "Too many requests" in res2.text
