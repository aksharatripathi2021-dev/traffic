"""
NIRNAY – Incident Reporting Routes

POST /api/incidents      – Citizen submits an incident (multipart/form-data)
GET  /api/incidents/{id} – Retrieve incident (citizen sees own, police sees all)
"""

import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.incident import Incident
from app.models.user import User
from app.models.enums import IncidentType, IncidentStatus, UserRole
from app.schemas.incident import IncidentCreateResponse, IncidentResponse
from app.utils.auth import get_current_user
from app.utils.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/incidents", tags=["Incidents"])

# ── Constants ────────────────────────────────────────────
ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
}
MAX_IMAGE_BYTES = settings.max_upload_size_mb * 1024 * 1024  # default 10 MB

# Nagpur approximate bounding box for basic validation
NAGPUR_LAT_MIN, NAGPUR_LAT_MAX = 20.90, 21.30
NAGPUR_LON_MIN, NAGPUR_LON_MAX = 78.85, 79.25


# ── POST /api/incidents ──────────────────────────────────
@router.post(
    "",
    response_model=IncidentCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Report a new incident",
    description=(
        "Citizens submit an incident via **multipart/form-data**.\n\n"
        "- `incident_type` – one of: accident, road_blocked, waterlogging, "
        "heavy_rain, heavy_congestion, traffic_violation, road_hazard, "
        "signal_failure, vehicle_breakdown, road_damage, other\n"
        "- `latitude` / `longitude` – GPS coordinates\n"
        "- `photo` – optional image (JPEG, PNG, WebP; max 10 MB)\n\n"
        "The server records `reported_at` automatically. "
        "Initial status is always **PENDING**."
    ),
)
async def create_incident(
    incident_type: IncidentType = Form(..., description="Type of incident"),
    latitude: float = Form(..., description="GPS latitude"),
    longitude: float = Form(..., description="GPS longitude"),
    photo: UploadFile | None = File(None, description="Incident photo (optional)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> IncidentCreateResponse:
    """Accept a citizen incident report with optional photo upload."""

    # ── Validate coordinates ─────────────────────────────
    if not (NAGPUR_LAT_MIN <= latitude <= NAGPUR_LAT_MAX):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Latitude {latitude} is outside the Nagpur area "
                f"({NAGPUR_LAT_MIN}–{NAGPUR_LAT_MAX})."
            ),
        )
    if not (NAGPUR_LON_MIN <= longitude <= NAGPUR_LON_MAX):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Longitude {longitude} is outside the Nagpur area "
                f"({NAGPUR_LON_MIN}–{NAGPUR_LON_MAX})."
            ),
        )

    # ── Handle photo upload ──────────────────────────────
    saved_photo_path: str | None = None

    if photo and photo.filename:
        # Validate content type
        if photo.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    f"Invalid image type '{photo.content_type}'. "
                    f"Allowed: {', '.join(sorted(ALLOWED_IMAGE_TYPES))}."
                ),
            )

        # Read file and validate size
        file_bytes = await photo.read()
        if len(file_bytes) > MAX_IMAGE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=(
                    f"Image size ({len(file_bytes) / 1024 / 1024:.1f} MB) "
                    f"exceeds the {settings.max_upload_size_mb} MB limit."
                ),
            )

        # Generate unique filename
        ext = Path(photo.filename).suffix.lower() or ".jpg"
        unique_name = f"{uuid.uuid4().hex}{ext}"
        upload_dir = Path(settings.upload_dir)
        upload_dir.mkdir(parents=True, exist_ok=True)
        file_path = upload_dir / unique_name

        # Write file
        with open(file_path, "wb") as f:
            f.write(file_bytes)

        saved_photo_path = str(file_path)

    # ── Create DB record ─────────────────────────────────
    incident = Incident(
        incident_type=incident_type,
        latitude=latitude,
        longitude=longitude,
        photo_path=saved_photo_path,
        status=IncidentStatus.PENDING,
        reported_by=current_user.id,
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    return IncidentCreateResponse(
        id=incident.id,
        incident_type=incident.incident_type,
        latitude=incident.latitude,
        longitude=incident.longitude,
        photo_path=incident.photo_path,
        reported_at=incident.reported_at,
        status=incident.status,
        message=f"Incident #{incident.id} reported successfully. Status: PENDING.",
    )


# ── GET /api/incidents/{id} ─────────────────────────────
@router.get(
    "/{incident_id}",
    response_model=IncidentResponse,
    summary="Get incident by ID",
    description=(
        "Retrieve a specific incident.\n\n"
        "- **Citizens** can only view incidents they reported.\n"
        "- **Police** can view any incident."
    ),
    responses={
        404: {"description": "Incident not found"},
        403: {"description": "Access denied"},
    },
)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> IncidentResponse:
    """Fetch a single incident with role-based access control."""

    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident #{incident_id} not found.",
        )

    # Citizens can only see their own incidents
    if (
        current_user.role == UserRole.CITIZEN
        and incident.reported_by != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You can only view incidents you reported.",
        )

    return IncidentResponse.model_validate(incident)
