"""
NIRNAY – Health Check Endpoint

GET /api/health
Returns application status, version, environment, and database
connectivity so operations can monitor the service at a glance.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.utils.config import get_settings

router = APIRouter(tags=["Health"])

settings = get_settings()


# ── Response schema ──────────────────────────────────────
class HealthResponse(BaseModel):
    """Schema for the health-check response."""
    status: str
    app_name: str
    version: str
    environment: str
    database: str
    timestamp: str
    message: str


# ── Endpoint ─────────────────────────────────────────────
@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service health check",
    description="Returns the current health status of the NIRNAY backend, "
                "including database connectivity.",
)
def health_check(db: Session = Depends(get_db)) -> HealthResponse:
    """Lightweight probe used by load-balancers and monitoring."""

    # Quick DB connectivity test
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return HealthResponse(
        status="healthy" if db_status == "connected" else "degraded",
        app_name=settings.app_name,
        version=settings.app_version,
        environment=settings.app_env,
        database=db_status,
        timestamp=datetime.now(timezone.utc).isoformat(),
        message=(
            "NIRNAY backend is running. "
            "AI-based Traffic Risk Heatmap & Police Deployment "
            "Decision-Support System for Nagpur City."
        ),
    )
