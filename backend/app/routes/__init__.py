"""NIRNAY – API routes package."""

from fastapi import APIRouter

from app.routes.health import router as health_router
from app.routes.auth import router as auth_router
from app.routes.incidents import router as incidents_router
from app.routes.risk import router as risk_router
from app.routes.police import router as police_router
from app.routes.deployment import router as deployment_router

# ── Aggregate router ─────────────────────────────────────
api_router = APIRouter(prefix="/api")
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(incidents_router)
api_router.include_router(risk_router)
api_router.include_router(police_router)
api_router.include_router(deployment_router)
