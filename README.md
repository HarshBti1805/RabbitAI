# Sales Insight Automator

AI-powered sales data summarization and delivery tool built for **Rabbitt AI**.

Upload a `.csv` or `.xlsx` sales file → get an AI-generated executive brief → delivered to your inbox.

---

## Architecture

```
┌──────────────────┐     POST /api/v1/upload      ┌──────────────────────┐
│   React SPA      │ ─────────────────────────────▶│   FastAPI Backend    │
│   Vite + Tailwind│                               │                      │
│                  │◀──── JSON { summary } ────────│  ┌────────────────┐  │
└──────────────────┘                               │  │  File Parser   │  │
                                                   │  │  (pandas)      │  │
                                                   │  └──────┬─────────┘  │
                                                   │         ▼            │
                                                   │  ┌────────────────┐  │
                                                   │  │  OpenAI API    │  │
                                                   │  │  (GPT-4o-mini) │  │
                                                   │  └──────┬─────────┘  │
                                                   │         ▼            │
                                                   │  ┌────────────────┐  │
                                                   │  │  SMTP Mailer   │  │
                                                   │  └────────────────┘  │
                                                   └──────────────────────┘
```

## Quick Start (Docker Compose)

### 1. Clone & Configure

```bash
git clone https://github.com/<your-username>/sales-insight-automator.git
cd sales-insight-automator

# Create backend env file
cp backend/.env.example backend/.env
# Edit backend/.env with your real credentials (see table below)
```

### 2. Start the Stack

```bash
docker-compose up --build
```

### 3. Access

| Service      | URL                          |
| ------------ | ---------------------------- |
| Frontend     | http://localhost:3000        |
| Backend API  | http://localhost:8000        |
| Swagger Docs | http://localhost:8000/docs   |
| ReDoc        | http://localhost:8000/redoc  |
| Health Check | http://localhost:8000/health |

### 4. Test the Flow

1. Open http://localhost:3000
2. Upload `sales_q1_2026.csv` (included in repo root)
3. Enter a recipient email address
4. Click **Generate & Send Brief**
5. View the summary on screen and check the inbox

---

## Running Without Docker

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit with real keys
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:8000
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable           | Description                               | Required |
| ------------------ | ----------------------------------------- | -------- |
| `OPENAI_API_KEY`   | Your OpenAI API key                       | Yes      |
| `OPENAI_MODEL`     | Model name (default: `gpt-4o-mini`)       | No       |
| `SMTP_HOST`        | SMTP server hostname                      | Yes      |
| `SMTP_PORT`        | SMTP port (default: `587`)                | No       |
| `SMTP_USER`        | SMTP login email                          | Yes      |
| `SMTP_PASSWORD`    | SMTP password / Gmail app password        | Yes      |
| `EMAIL_FROM`       | "From" address on emails                  | Yes      |
| `CORS_ORIGINS`     | JSON array of allowed frontend origins    | No       |
| `API_KEY`          | Shared secret for `X-API-Key` header auth | No       |
| `MAX_FILE_SIZE_MB` | Upload size limit in MB (default: `10`)   | No       |

### Frontend (`frontend/.env`)

| Variable       | Description                              |
| -------------- | ---------------------------------------- |
| `VITE_API_URL` | Backend URL (e.g. http://localhost:8000) |
| `VITE_API_KEY` | Must match backend's `API_KEY`           |

---

## Security Overview

### 1. API Key Authentication

When `API_KEY` is set in the backend environment, every request must include a matching `X-API-Key` header. Implemented via FastAPI's `Security()` dependency injection with `APIKeyHeader`. If unset, auth is disabled (useful for local dev).

### 2. Rate Limiting

The `/api/v1/upload` endpoint is limited to **10 requests per minute per IP** using `slowapi`. This protects both the server and the OpenAI API budget from abuse.

### 3. File Validation

- **Extension whitelist:** Only `.csv`, `.xlsx`, `.xls` accepted.
- **Size limit:** Configurable (default 10 MB), enforced before any processing.
- **Content parsing:** Files are read through pandas, which safely deserializes tabular data without code execution.

### 4. CORS Policy

Origins are explicitly listed via `CORS_ORIGINS`. No wildcard (`*`) in production.

### 5. Container Hardening

- **Multi-stage Docker builds** — no build tools, pip cache, or source in the runtime image.
- **Non-root user** (`appuser`) runs the backend process.
- **Nginx security headers** on the frontend: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Content-Security-Policy`.

### 6. Input Validation

Email addresses validated by Pydantic's `EmailStr`. All request data validated through typed schemas before processing.

---

## CI/CD Pipeline

`.github/workflows/ci.yml` runs on every PR to `main` and every push to `main`:

**Backend job:**

1. Install Python 3.12 + project deps
2. `flake8` lint
3. Verify FastAPI app imports and routes resolve
4. Build Docker image

**Frontend job:**

1. Install Node 20 + `npm ci`
2. `eslint` lint
3. `vite build` production bundle
4. Build Docker image

---

## Deployment

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect GitHub repo → set root directory to `backend`
3. Environment: **Docker**
4. Add all env vars from `.env.example`
5. Deploy

### Frontend → Vercel

1. Import repo on [Vercel](https://vercel.com)
2. Root directory: `frontend`
3. Framework preset: **Vite**
4. Environment variable: `VITE_API_URL` = your Render backend URL
5. Deploy

---

## Tech Stack

| Layer      | Technology                                       |
| ---------- | ------------------------------------------------ |
| Frontend   | React 18, Vite 5, Tailwind CSS 3, react-dropzone |
| Backend    | FastAPI, Pydantic v2, pandas, slowapi            |
| AI Engine  | OpenAI API (GPT-4o-mini)                         |
| Email      | SMTP (Gmail / any provider)                      |
| API Docs   | Swagger UI + ReDoc (auto-generated by FastAPI)   |
| Containers | Docker multi-stage builds, docker-compose        |
| CI/CD      | GitHub Actions                                   |

---

## Project Structure

```
sales-insight-automator/
├── backend/
│   ├── app/
│   │   ├── core/           # config, rate limiter, security deps
│   │   ├── models/         # Pydantic request/response schemas
│   │   ├── routers/        # API route handlers
│   │   ├── services/       # parser, AI summarizer, email sender
│   │   └── main.py         # FastAPI application entrypoint
│   ├── Dockerfile          # Multi-stage, non-root
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # Header, UploadCard, SummaryPanel
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile          # Multi-stage Node → Nginx
│   ├── nginx.conf          # SPA routing + security headers
│   └── .env.example
├── .github/
│   └── workflows/
│       └── ci.yml          # Lint + Build on PR
├── docker-compose.yml      # Full stack orchestration
├── sales_q1_2026.csv       # Sample test data
└── README.md               # This file
```

---