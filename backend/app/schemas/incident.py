"""
NIRNAY – Incident Pydantic Schemas

Request / response models for citizen incident reporting.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import IncidentType, IncidentStatus


# ── Response schemas ─────────────────────────────────────
class IncidentResponse(BaseModel):
    """Full incident details (returned to the reporting citizen or police)."""
    id: int
    incident_type: IncidentType
    latitude: float
    longitude: float
    photo_path: Optional[str] = None
    reported_at: datetime
    status: IncidentStatus
    reported_by: Optional[int] = None
    message: Optional[str] = None

    model_config = {"from_attributes": True}


class IncidentCreateResponse(BaseModel):
    """Returned immediately after a citizen submits an incident."""
    id: int
    incident_type: IncidentType
    latitude: float
    longitude: float
    photo_path: Optional[str] = None
    reported_at: datetime
    status: IncidentStatus
    message: str

    model_config = {"from_attributes": True}


class IncidentListResponse(BaseModel):
    """Paginated list of incidents."""
    total: int
    incidents: list[IncidentResponse]
