"""Send emails via EmailJS HTTP API."""

import logging
import requests
import markdown as md
from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(to_address: str, summary_markdown: str) -> None:
    """Send email via EmailJS REST API."""
    html_body = md.markdown(
        summary_markdown, extensions=["tables", "fenced_code"]
    )

    response = requests.post(
        "https://api.emailjs.com/api/v1.0/email/send",
        json={
            "service_id": settings.EMAILJS_SERVICE_ID,
            "template_id": settings.EMAILJS_TEMPLATE_ID,
            "user_id": settings.EMAILJS_PUBLIC_KEY,
            "accessToken": settings.EMAILJS_PRIVATE_KEY,
            "template_params": {
                "to_email": to_address,
                "message": html_body,
            },
        },
    )

    if response.status_code != 200:
        logger.error(
            "EmailJS error: %s %s", response.status_code, response.text
        )
        raise Exception(f"Email delivery failed: {response.text}")

    logger.info("Email sent via EmailJS to %s", to_address)