"""Upload & Summarize router – the core workflow endpoint."""

import logging
from fastapi import (
    APIRouter,
    File,
    Form,
    UploadFile,
    Depends,
    HTTPException,
    Request,
)

from app.core.security import verify_api_key, validate_file
from app.core.limiter import limiter
from app.core.config import settings
from app.models.schemas import SummaryResponse, ErrorResponse
from app.services.parser import parse_file
from app.services.summarizer import generate_summary
from app.services.mailer import send_email

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/upload",
    response_model=SummaryResponse,
    summary="Upload sales data & email AI summary",
    description=(
        "Accepts a `.csv` or `.xlsx` file alongside a recipient email. "
        "The file is parsed, summarized by OpenAI, and the resulting "
        "executive brief is emailed to the recipient and returned in the response."
    ),
    responses={
        400: {"model": ErrorResponse, "description": "Bad request / invalid file."},
        403: {"model": ErrorResponse, "description": "Invalid API key."},
        429: {"description": "Rate limit exceeded (10 req/min)."},
        500: {"model": ErrorResponse, "description": "Internal processing error."},
    },
)
@limiter.limit("10/minute")
async def upload_and_summarize(
    request: Request,
    file: UploadFile = File(
        ..., description="A .csv or .xlsx sales data file (max 10 MB)"
    ),
    email: str = Form(
        ..., description="Recipient email address for the summary"
    ),
    _api_key: str = Depends(verify_api_key),
) -> SummaryResponse:
    """
    **End-to-end flow:**

    1. Validate uploaded file (type & size).
    2. Parse the data into a text representation.
    3. Send data to OpenAI for executive summary generation.
    4. Email the summary to the provided address via SMTP.
    5. Return the summary in the response body.
    """
    # 1 – Validate file type
    validate_file(file)

    # 1b – Validate file size
    contents = await file.read()
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds {settings.MAX_FILE_SIZE_MB} MB limit.",
        )
    await file.seek(0)  # reset for parser

    try:
        # 2 – Parse
        logger.info("Parsing file: %s (%d bytes)", file.filename, len(contents))
        data_text = await parse_file(file)

        # 3 – Summarize with OpenAI
        logger.info("Generating AI summary...")
        summary = await generate_summary(data_text)

        # 4 – Email
        logger.info("Sending summary to %s", email)
        send_email(email, summary)

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Processing failed: %s", exc)
        raise HTTPException(
            status_code=500, detail=f"Processing error: {exc}"
        )

    # 5 – Respond
    return SummaryResponse(
        message="Summary generated and emailed successfully!",
        summary=summary,
        email_sent_to=email,
    )
