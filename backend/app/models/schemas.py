"""Request / Response schemas."""

from pydantic import BaseModel


class SummaryResponse(BaseModel):
    message: str
    summary: str
    email_sent_to: str


class ErrorResponse(BaseModel):
    detail: str
