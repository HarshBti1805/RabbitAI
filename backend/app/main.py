"""
Sales Insight Automator – Backend API
=====================================
Processes sales data files, generates AI summaries via OpenAI,
and delivers them by email.
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.limiter import limiter
from app.routers import upload

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

app = FastAPI(
    title="Sales Insight Automator API",
    description=(
        "Upload CSV/XLSX sales data and receive an AI-generated executive "
        "summary delivered straight to your inbox.\n\n"
        "**Authentication:** Include `X-API-Key` header if the server is "
        "configured with an API key.\n\n"
        "**Rate Limit:** 10 requests per minute per IP on the upload endpoint."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    contact={
        "name": "Rabbitt AI Engineering",
        "url": "https://github.com/rabbitt-ai",
    },
)

# ── Rate Limiting ────────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(upload.router, prefix="/api/v1", tags=["Upload & Summarize"])


@app.get("/", tags=["Health"], summary="Root health check")
async def root():
    """Quick liveness probe."""
    return {"status": "ok", "service": "Sales Insight Automator"}


@app.get("/health", tags=["Health"], summary="Detailed health check")
async def health():
    """Returns service version and AI provider info."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "ai_provider": "OpenAI",
        "model": settings.OPENAI_MODEL,
    }
