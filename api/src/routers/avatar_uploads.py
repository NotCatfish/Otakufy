import uuid
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from src.config.security import upload_rate_limiter, get_secure_deps
from src.config.settings import settings

router = APIRouter(
    prefix="/upload",
    tags=["Security & Uploads"],
    dependencies=get_secure_deps(upload_rate_limiter),
)


class FileValidator:
    """OOP File validation and secure persistence handler."""

    @staticmethod
    async def validate_and_save(file: UploadFile) -> str:
        content = await file.read()
        if len(content) > settings.max_file_size:
            raise HTTPException(status_code=413, detail="File too large. Maximum size is 2MB.")

        ext = next(
            (ext for magic, ext in settings.allowed_signatures.items() if content.startswith(magic)),
            None,
        )
        if not ext:
            raise HTTPException(
                status_code=415,
                detail="Invalid file signature. Only JPG, PNG, and WEBP are allowed.",
            )

        secure_filename = f"{uuid.uuid4().hex}.{ext}"
        (settings.upload_dir / secure_filename).write_bytes(content)
        return secure_filename


@router.post("/avatar")
async def secure_avatar_upload(file: UploadFile = File(...)) -> dict[str, str]:
    """Zero-Trust avatar upload verifying magic bytes, enforcing 2MB limit, and saving as UUID."""
    return {"status": "success", "file_id": await FileValidator.validate_and_save(file)}
