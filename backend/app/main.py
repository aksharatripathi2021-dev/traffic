"""
NIRNAY – FastAPI Application Entry-Point

Configures middleware, mounts routers, creates DB tables on startup,
and exposes Swagger / ReDoc documentation.
"""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.database.seed import seed_demo_data
from app.routes import api_router
from app.utils.config import get_settings

settings = get_settings()


# ── Lifespan (startup / shutdown) ────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run once on startup, yield, then run on shutdown."""
    # Startup – create tables & seed demo data
    init_db()
    seed_demo_data()

    # Ensure the uploads directory exists
    uploads = Path(settings.upload_dir)
    uploads.mkdir(parents=True, exist_ok=True)

    print(f"[NIRNAY] {settings.app_name} v{settings.app_version} started "
          f"[{settings.app_env}]")
    print(f"[NIRNAY] Upload directory: {uploads.resolve()}")

    yield  # application serves requests here

    # Shutdown
    print(f"[NIRNAY] {settings.app_name} shutting down.")


# ── Application instance ────────────────────────────────
app = FastAPI(
    title=f"{settings.app_name} – Traffic Risk & Police Deployment API",
    description=(
        "**NIRNAY** is an AI-based traffic risk heatmap and police "
        "deployment decision-support system for **Nagpur City**.\n\n"
        "### Roles\n"
        "| Role | Capabilities |\n"
        "|------|-------------|\n"
        "| **Citizen** | View zones, report incidents (photo + GPS + time + type) |\n"
        "| **Police** | View risk scores, trends, coverage gaps, officer availability, "
        "accept/modify/reject AI recommendations |\n\n"
        "⚠️ *All data in this MVP is **DEMO / SIMULATED** and does not represent "
        "real Nagpur Police operations or live traffic feeds.*"
    ),
    version=settings.app_version,
    docs_url="/docs",       # Swagger UI
    redoc_url="/redoc",     # ReDoc
    openapi_url="/openapi.json",
    lifespan=lifespan,
)


# ── CORS Middleware ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Mount routers ────────────────────────────────────────
app.include_router(api_router)


# ── Root redirect to docs ───────────────────────────────
@app.get("/", include_in_schema=False)
def root():
    """Redirect bare root to Swagger docs for convenience."""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/docs")
