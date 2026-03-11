"""Security utilities – API key validation & file validation."""

from fastapi import HTTPException, UploadFile, Security
from fastapi.security import APIKeyHeader

from app.core.config import settings

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(
    api_key: str = Security(api_key_header),
) -> str:
    """Require X-API-Key header when API_KEY env var is set."""
    if settings.API_KEY and api_key != settings.API_KEY:
        raise HTTPException(status_code=403, detail="Invalid or missing API key.")
    return api_key or ""


ALLOWED_EXTENSIONS = {"csv", "xlsx", "xls"}
ALLOWED_MIMETYPES = {
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/octet-stream",
}


def validate_file(file: UploadFile) -> None:
    """Validate uploaded file extension and content-type."""
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '.{ext}'. Allowed: .csv, .xlsx, .xls",
        )
