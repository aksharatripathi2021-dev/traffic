"""
NIRNAY – Deployment Recommendations Route

GET /api/deployment/recommend/{junction_id} – Recommend available officers
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Junction, UserRole, User
from app.schemas.recommendation import RecommendationResponse, RecommendedOfficer
from app.schemas.decision import (
    DeploymentModifyRequest,
    DeploymentRejectRequest,
    DeploymentDecisionResponse,
)
from app.services.recommendation_engine import get_recommendations_for_junction
from app.services.risk_engine import calculate_risk
from app.utils.auth import require_role

router = APIRouter(prefix="/deployment", tags=["Police Recommendations"])


# ── GET /api/deployment/recommend/{junction_id} ──────────
@router.get(
    "/recommend/{junction_id}",
    response_model=RecommendationResponse,
    dependencies=[Depends(require_role(UserRole.POLICE))],
    summary="Get deployment recommendations for a junction (Police Only)",
    description=(
        "Computes and recommends available police officers to dispatch "
        "to a junction based on its current risk level and coverage gap.\n\n"
        "**Access restricted to POLICE users.**"
    ),
    responses={
        403: {"description": "Access denied. Police credentials required."},
        404: {"description": "Junction not found"},
    },
)
def recommend_deployment(
    junction_id: str,
    db: Session = Depends(get_db),
) -> RecommendationResponse:
    """Ranks closest available police officers for dispatch recommendation."""

    # 1. Fetch Junction
    junction = (
        db.query(Junction)
        .filter(Junction.junction_id == junction_id)
        .first()
    )
    if junction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Junction '{junction_id}' not found.",
        )

    # 2. Get latest risk score dynamically
    risk_res = calculate_risk(db, junction)
    risk_score = risk_res.risk_score

    # 3. Compute recommendations
    rec = get_recommendations_for_junction(db, junction, risk_score)

    return RecommendationResponse(
        junction_id=rec["junction_id"],
        junction_name=rec["junction_name"],
        risk_score=rec["risk_score"],
        coverage_gap=rec["coverage_gap"],
        recommended_officers=[
            RecommendedOfficer(**o) for o in rec["recommended_officers"]
        ],
        disclaimer=(
            "PROTOTYPE MODEL — This recommendation lists simulated officers "
            "and response times. It is NOT scientifically validated for actual dispatch."
        ),
    )


# ── POST /api/deployment/{recommendation_id}/accept ──────
@router.post(
    "/{recommendation_id}/accept",
    response_model=DeploymentDecisionResponse,
    summary="Accept a deployment recommendation (Police Only)",
    description="Marks a recommended dispatch candidate as ACCEPTED.",
    responses={
        403: {"description": "Access denied. Police credentials required."},
        404: {"description": "Recommendation not found"},
    },
)
def accept_recommendation(
    recommendation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.POLICE)),
) -> DeploymentDecisionResponse:
    """Marks the recommendation status as ACCEPTED and audits the decision."""
    from app.models.deployment_recommendation import DeploymentRecommendation
    from app.models.enums import DeploymentStatus
    from datetime import datetime, timezone

    rec = (
        db.query(DeploymentRecommendation)
        .filter(DeploymentRecommendation.id == recommendation_id)
        .first()
    )
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deployment recommendation #{recommendation_id} not found.",
        )

    rec.status = DeploymentStatus.ACCEPTED
    rec.decided_by = current_user.id
    rec.decided_at = datetime.now(timezone.utc)
    rec.selected_officers = rec.officer_id  # default to original recommended officer

    db.commit()
    db.refresh(rec)

    return DeploymentDecisionResponse(
        id=rec.id,
        junction_id=rec.junction_id,
        officer_id=rec.officer_id,
        status=rec.status,
        decided_by=rec.decided_by,
        decided_at=rec.decided_at,
        selected_officers=rec.selected_officers,
        modification_reason=rec.modification_reason,
        message=f"Recommendation #{rec.id} ACCEPTED successfully.",
    )


# ── POST /api/deployment/{recommendation_id}/modify ──────
@router.post(
    "/{recommendation_id}/modify",
    response_model=DeploymentDecisionResponse,
    summary="Modify a deployment recommendation (Police Only)",
    description="Updates the recommended officers for this dispatch decision and marks it as MODIFIED.",
    responses={
        403: {"description": "Access denied. Police credentials required."},
        404: {"description": "Recommendation not found"},
    },
)
def modify_recommendation(
    recommendation_id: int,
    body: DeploymentModifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.POLICE)),
) -> DeploymentDecisionResponse:
    """Marks recommendation as MODIFIED, updates officers list, and audits reason."""
    from app.models.deployment_recommendation import DeploymentRecommendation
    from app.models.enums import DeploymentStatus
    from datetime import datetime, timezone

    rec = (
        db.query(DeploymentRecommendation)
        .filter(DeploymentRecommendation.id == recommendation_id)
        .first()
    )
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deployment recommendation #{recommendation_id} not found.",
        )

    rec.status = DeploymentStatus.MODIFIED
    rec.decided_by = current_user.id
    rec.decided_at = datetime.now(timezone.utc)
    rec.selected_officers = ", ".join(body.selected_officers)
    rec.modification_reason = body.modification_reason

    db.commit()
    db.refresh(rec)

    return DeploymentDecisionResponse(
        id=rec.id,
        junction_id=rec.junction_id,
        officer_id=rec.officer_id,
        status=rec.status,
        decided_by=rec.decided_by,
        decided_at=rec.decided_at,
        selected_officers=rec.selected_officers,
        modification_reason=rec.modification_reason,
        message=f"Recommendation #{rec.id} MODIFIED successfully.",
    )


# ── POST /api/deployment/{recommendation_id}/reject ──────
@router.post(
    "/{recommendation_id}/reject",
    response_model=DeploymentDecisionResponse,
    summary="Reject a deployment recommendation (Police Only)",
    description="Marks the recommendation as REJECTED and stores the audit reason.",
    responses={
        403: {"description": "Access denied. Police credentials required."},
        404: {"description": "Recommendation not found"},
    },
)
def reject_recommendation(
    recommendation_id: int,
    body: DeploymentRejectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.POLICE)),
) -> DeploymentDecisionResponse:
    """Marks recommendation as REJECTED, clears selections, and records audit explanation."""
    from app.models.deployment_recommendation import DeploymentRecommendation
    from app.models.enums import DeploymentStatus
    from datetime import datetime, timezone

    rec = (
        db.query(DeploymentRecommendation)
        .filter(DeploymentRecommendation.id == recommendation_id)
        .first()
    )
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deployment recommendation #{recommendation_id} not found.",
        )

    rec.status = DeploymentStatus.REJECTED
    rec.decided_by = current_user.id
    rec.decided_at = datetime.now(timezone.utc)
    rec.selected_officers = None
    rec.modification_reason = body.rejection_reason

    db.commit()
    db.refresh(rec)

    return DeploymentDecisionResponse(
        id=rec.id,
        junction_id=rec.junction_id,
        officer_id=rec.officer_id,
        status=rec.status,
        decided_by=rec.decided_by,
        decided_at=rec.decided_at,
        selected_officers=rec.selected_officers,
        modification_reason=rec.modification_reason,
        message=f"Recommendation #{rec.id} REJECTED successfully.",
    )
