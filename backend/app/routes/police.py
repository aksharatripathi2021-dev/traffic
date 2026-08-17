"""
NIRNAY – Police Operations Control Routes

GET /api/police/zones/{zone_id} – Full details for a Nagpur zone (Police-Only)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Zone, Junction, PoliceUnit, DeploymentRecommendation, UserRole
from app.models.enums import PoliceUnitStatus, RiskLevel
from app.schemas.police import (
    PoliceZoneDetailResponse,
    ZoneInfo,
    JunctionInfo,
    RiskInfo,
    CoverageInfo,
    NearbyOfficer,
    RecommendationInfo,
)
from app.utils.auth import require_role
from app.services.coverage_engine import calculate_zone_coverage, _haversine_km
from app.services.risk_engine import calculate_risk, determine_trend_direction, score_to_risk_level

router = APIRouter(prefix="/police", tags=["Police Operations"])


# ── GET /api/police/zones/{zone_id} ──────────────────────
@router.get(
    "/zones/{zone_id}",
    response_model=PoliceZoneDetailResponse,
    dependencies=[Depends(require_role(UserRole.POLICE))],
    summary="Get full details for a zone (Police Only)",
    description=(
        "Returns the complete decision-support information for the specified "
        "Nagpur zone. Includes risk levels, trends, police coverage gap analysis, "
        "nearby officers, and AI recommendations.\n\n"
        "**Access restricted to POLICE users.**"
    ),
    responses={
        403: {"description": "Access denied. Police credentials required."},
        404: {"description": "Zone not found"},
    },
)
def get_zone_details(
    zone_id: str,
    db: Session = Depends(get_db),
) -> PoliceZoneDetailResponse:
    """Detailed operational zone assessment for Nagpur Police command center."""
    from datetime import datetime, timezone
    from app.models import Traffic, Incident
    from app.schemas.police import (
        JunctionInfo,
        ZoneInfo,
        RiskInfo,
        CoverageInfo,
        NearbyOfficer,
        RecommendationInfo,
    )

    # 1. Fetch Zone
    zone = db.query(Zone).filter(Zone.zone_id == zone_id).first()
    if zone is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Zone '{zone_id}' not found.",
        )

    # 2. Get Junctions in this zone
    junctions = db.query(Junction).filter(Junction.zone_id == zone_id).all()
    if not junctions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No junctions configured for zone '{zone_id}'.",
        )

    j_ids = [j.junction_id for j in junctions]

    # Optimize Query: Find latest update timestamp from Traffic/Incidents
    latest_traffic = (
        db.query(Traffic)
        .filter(Traffic.junction_id.in_(j_ids))
        .order_by(Traffic.timestamp.desc())
        .first()
    )
    latest_traffic_ts = latest_traffic.timestamp if latest_traffic else None

    latest_incident = (
        db.query(Incident)
        .order_by(Incident.reported_at.desc())
        .first()
    )
    latest_incident_ts = latest_incident.reported_at if latest_incident else None

    update_timestamps = [ts for ts in [latest_traffic_ts, latest_incident_ts] if ts is not None]
    last_update = (
        max(update_timestamps).isoformat()
        if update_timestamps
        else datetime.now(timezone.utc).isoformat()
    )

    # Compile Junction information list
    junctions_info = [
        JunctionInfo(
            junction_id=j.junction_id,
            junction_name=j.junction_name,
            road_type=j.road_type.value,
            latitude=j.latitude,
            longitude=j.longitude,
        )
        for j in junctions
    ]

    zone_info = ZoneInfo(
        zone_name=zone.zone_name,
        zone_id=zone.zone_id,
        junctions=junctions_info,
        current_time=datetime.now(timezone.utc).isoformat(),
        last_data_update=last_update,
    )

    # 3. Calculate Zone Risk Score & Key Factors
    total_risk = 0.0
    key_factors = []
    for j in junctions:
        res = calculate_risk(db, j)
        total_risk += res.risk_score
        key_factors.extend(res.key_factors[:2])

    avg_risk = round(total_risk / len(junctions), 1)
    risk_level = score_to_risk_level(avg_risk)

    deduped_factors = []
    for f in key_factors:
        if f not in deduped_factors and f != "All factors within normal range":
            deduped_factors.append(f)
    if not deduped_factors:
        deduped_factors = ["All factors within normal range"]

    # 4. Calculate Risk Trend for the Zone
    from app.models.risk_history import RiskHistory
    histories = (
        db.query(RiskHistory)
        .filter(RiskHistory.junction_id.in_(j_ids))
        .order_by(RiskHistory.timestamp.asc())
        .all()
    )

    time_groups = {}
    for h in histories:
        time_str = h.timestamp.isoformat()
        if time_str not in time_groups:
            time_groups[time_str] = []
        time_groups[time_str].append(h.risk_score)

    sorted_time_keys = sorted(time_groups.keys())
    historical_avg_scores = [
        sum(time_groups[tk]) / len(time_groups[tk]) for tk in sorted_time_keys
    ]

    trend = determine_trend_direction(historical_avg_scores)
    risk_info = RiskInfo(
        score=avg_risk,
        risk_level=risk_level,
        trend=trend,
        key_factors=deduped_factors[:4],
    )

    # 5. Calculate Zone Coverage
    coverage_info = calculate_zone_coverage(db, zone)
    coverage = CoverageInfo(
        current_coverage=coverage_info["current_coverage"],
        required_coverage=coverage_info["required_coverage"],
        coverage_gap=coverage_info["coverage_gap"],
        status=coverage_info["coverage_status"],
    )

    # 6. Nearby Available Officers
    available_officers = (
        db.query(PoliceUnit)
        .filter(PoliceUnit.status == PoliceUnitStatus.AVAILABLE)
        .all()
    )

    nearby_officers = []
    for o in available_officers:
        dist = _haversine_km(zone.latitude, zone.longitude, o.latitude, o.longitude)
        if dist <= 4.0:
            nearby_officers.append(
                NearbyOfficer(
                    officer_id=o.officer_id,
                    distance=round(dist, 2),
                    estimated_response_time=round(max(dist * 4.0, 3.0), 1),
                    availability=o.status,
                )
            )
    nearby_officers.sort(key=lambda x: x.distance)

    # 7. AI Recommendation
    recommendations = (
        db.query(DeploymentRecommendation)
        .filter(DeploymentRecommendation.junction_id.in_(j_ids))
        .all()
    )

    recommendation = None
    if recommendations:
        rec_ids = sorted(list({r.officer_id for r in recommendations}))
        max_response = max(r.estimated_response_minutes for r in recommendations)
        min_response = min(r.estimated_response_minutes for r in recommendations)

        if abs(max_response - min_response) < 1.0:
            resp_window = f"{round(min_response)} minutes"
        else:
            resp_window = f"{round(min_response)}–{round(max_response)} minutes"

        reason_texts = [r.reason for r in recommendations]
        deduped_reasons = []
        for r in reason_texts:
            clean_reason = r.replace("[DEMO] ", "").strip()
            if clean_reason not in deduped_reasons:
                deduped_reasons.append(clean_reason)

        reason = "; ".join(deduped_reasons)

        recommendation = RecommendationInfo(
            recommended_officers=rec_ids,
            estimated_response=resp_window,
            explanation=f"[DEMO] Recommended due to: {reason}",
        )

    return PoliceZoneDetailResponse(
        zone=zone_info,
        risk=risk_info,
        coverage=coverage,
        nearby_officers=nearby_officers,
        recommendation=recommendation,
        disclaimer=(
            "PROTOTYPE MODEL — This police control dashboard presents simulated "
            "data and AI recommendations for demonstration purposes. It is NOT "
            "scientifically validated or officially sanctioned for dispatch."
        ),
    )
