"""
app/main.py
-----------
FastAPI application factory.

Responsibilities:
- Creates and configures the FastAPI application instance.
- Mounts every module router under /api/v1/<module-name>.
- Exposes GET /health as a simple liveness probe.
- Applies global middleware (CORS, exception handlers).

TODO: Add startup/shutdown lifespan events (e.g. DB pool warm-up).
TODO: Add rate-limiting middleware.
TODO: Add structured logging middleware.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

# ── Module Routers ──────────────────────────────────────────────────────────
from app.modules.auth.router import router as auth_router
from app.modules.users.router import router as users_router
from app.modules.domains.router import router as domains_router
from app.modules.exams.router import router as exams_router
from app.modules.slots.router_admin import router as slots_admin_router
from app.modules.slots.router_student import router as slots_student_router
from app.modules.halls.router import router as halls_router
from app.modules.allocation.router import router as allocation_router
from app.modules.secret_code.router import router as secret_code_router
from app.modules.hall_sheets.router import router as hall_sheets_router
from app.modules.progress.router import router as progress_router
from app.modules.attempts.router import router as attempts_router
from app.modules.ai_engine.router import router as ai_engine_router
from app.modules.analytics.router import router as analytics_router
from app.modules.notifications.router import router as notifications_router

# ── App Factory ─────────────────────────────────────────────────────────────

app = FastAPI(
    title="Skill Leveling Platform",
    description="API for student-driven skill assessment and leveling.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS Middleware ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health Endpoint ──────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    """Liveness probe — returns 200 OK when the server is running."""
    return {"status": "ok", "service": "skill-leveling-platform"}


# ── Mount Module Routers ─────────────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(auth_router,          prefix=f"{API_PREFIX}/auth",          tags=["Auth"])
app.include_router(users_router,         prefix=f"{API_PREFIX}/users",         tags=["Users"])
app.include_router(domains_router,       prefix=f"{API_PREFIX}/domains",       tags=["Domains"])
app.include_router(exams_router,         prefix=f"{API_PREFIX}/exams",         tags=["Exams"])
app.include_router(slots_admin_router,   prefix=f"{API_PREFIX}/slots/admin",   tags=["Slots - Admin"])
app.include_router(slots_student_router, prefix=f"{API_PREFIX}/slots/student", tags=["Slots - Student"])
app.include_router(halls_router,         prefix=f"{API_PREFIX}/halls",         tags=["Halls"])
app.include_router(allocation_router,    prefix=f"{API_PREFIX}/allocation",    tags=["Allocation"])
app.include_router(secret_code_router,   prefix=f"{API_PREFIX}/secret-code",   tags=["Secret Code"])
app.include_router(hall_sheets_router,   prefix=f"{API_PREFIX}/hall-sheets",   tags=["Hall Sheets"])
app.include_router(progress_router,      prefix=f"{API_PREFIX}/progress",      tags=["Progress"])
app.include_router(attempts_router,      prefix=f"{API_PREFIX}/attempts",      tags=["Attempts"])
app.include_router(ai_engine_router,     prefix=f"{API_PREFIX}/ai-engine",     tags=["AI Engine"])
app.include_router(analytics_router,     prefix=f"{API_PREFIX}/analytics",     tags=["Analytics"])
app.include_router(notifications_router, prefix=f"{API_PREFIX}/notifications",  tags=["Notifications"])
