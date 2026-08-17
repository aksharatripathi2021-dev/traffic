"""
NIRNAY – Risk Engine (Hackathon Prototype)
==========================================
DISCLAIMER: This is a **prototype weighted-scoring model** built for
a hackathon MVP. It is NOT scientifically validated, NOT an official
police risk model, and must NOT be used for real operational decisions.
All factor weights and thresholds are illustrative.

The engine calculates a transparent, explainable risk score (0–100)
for each junction by evaluating multiple normalised factors and
producing human-readable explanations of *why* the score is high or low.

Risk levels:
    0–39   LOW
    40–59  MODERATE
    60–79  HIGH
    80–100 CRITICAL
"""

from datetime import datetime, timezone, timedelta
from dataclasses import dataclass, field
from math import radians, sin, cos, sqrt, atan2

from sqlalchemy.orm import Session

from app.models import (
    Junction,
    Incident,
    Traffic,
    RiskScore,
    RiskHistory,
    PoliceUnit,
    IncidentType,
    IncidentStatus,
    TrafficLevel,
    PoliceUnitStatus,
    RiskLevel,
)


# ═══════════════════════════════════════════════════════════
#  CONFIGURATION — all tuneable weights in ONE place
# ═══════════════════════════════════════════════════════════
@dataclass(frozen=True)
class RiskWeights:
    """
    Centralised weight configuration for the risk scoring model.
    All weights should sum to 1.0 for a clean 0–100 output.
    Adjust these during demos to show sensitivity analysis.
    """
    historical_accident: float = 0.20
    current_traffic: float = 0.25
    recent_incidents: float = 0.20
    road_obstruction: float = 0.10
    weather: float = 0.10
    police_coverage_gap: float = 0.15

    # ── Thresholds & look-back windows ───────────────────
    incident_lookback_hours: int = 24
    nearby_radius_km: float = 2.0
    high_density_threshold: float = 80.0   # vehicles/min
    max_incidents_for_100: int = 5          # 5+ recent incidents → factor = 100
    required_officers_per_junction: int = 2

    # ── DEMO/SIMULATED accident statistics weights (Maharashtra Road Crash Reports 2022, 2024) ──
    demo_vulnerable_road_users_pct_2022: float = 74.0
    demo_vulnerable_road_users_pct_2024: float = 78.0
    demo_two_three_wheeler_fatalities_2022: int = 8180
    demo_two_three_wheeler_fatalities_2024: int = 8849
    demo_speeding_contribution_pct: float = 70.0
    demo_nagpur_rural_fatalities_2022: int = 492
    demo_nashik_rural_fatalities_2024: int = 1031


# Singleton instance – importers can override for testing
WEIGHTS = RiskWeights()


# ═══════════════════════════════════════════════════════════
#  RISK LEVEL MAPPER
# ═══════════════════════════════════════════════════════════
def score_to_risk_level(score: float) -> RiskLevel:
    """Map a 0–100 score to a named risk level."""
    if score >= 80:
        return RiskLevel.CRITICAL
    if score >= 60:
        return RiskLevel.HIGH
    if score >= 40:
        return RiskLevel.MEDIUM
    return RiskLevel.LOW


# ═══════════════════════════════════════════════════════════
#  INDIVIDUAL FACTOR CALCULATORS  (each returns 0–100)
# ═══════════════════════════════════════════════════════════

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two GPS points in kilometres."""
    R = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


def calc_historical_accident_factor(
    db: Session, junction: Junction, w: RiskWeights = WEIGHTS
) -> tuple[float, str]:
    """
    Historical accident density near this junction.
    Counts ACCIDENT-type incidents within the look-back window and
    nearby radius.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(hours=w.incident_lookback_hours * 7)
    accidents = (
        db.query(Incident)
        .filter(
            Incident.incident_type == IncidentType.ACCIDENT,
            Incident.reported_at >= cutoff,
        )
        .all()
    )
    nearby = sum(
        1 for a in accidents
        if _haversine_km(junction.latitude, junction.longitude, a.latitude, a.longitude)
        <= w.nearby_radius_km
    )
    base_score = min(nearby / max(w.max_incidents_for_100, 1) * 100, 100.0)

    # Scale based on Two/Three-wheeler growth from 8,180 (2022) to 8,849 (2024): 8849/8180 = 1.08x
    # and account for Vulnerable Road Users (74% deaths in 2022, 78% deaths in 2024).
    score = min(base_score * 1.08, 100.0)
    explanation = (
        f"{nearby} accident(s) within {w.nearby_radius_km} km. [DEMO/SIMULATED scaled by 1.08x representing "
        f"78% vulnerable deaths and 8,849 two/three-wheeler fatalities (from 2024 Maharashtra Road Crash Report)]"
    )
    return round(score, 1), explanation


def calc_current_traffic_factor(
    db: Session, junction: Junction, w: RiskWeights = WEIGHTS
) -> tuple[float, str]:
    """
    Latest traffic reading at this junction.
    Maps vehicle_density to 0–100 using the high-density threshold.
    """
    latest = (
        db.query(Traffic)
        .filter(Traffic.junction_id == junction.junction_id)
        .order_by(Traffic.timestamp.desc())
        .first()
    )
    if latest is None:
        return 0.0, "No traffic data available"

    density = latest.vehicle_density
    base_score = min(density / w.high_density_threshold * 100, 100.0)

    # Evening peak risk hours (6 PM - 9 PM / 18:00 - 21:00) check based on system local time
    local_hour = datetime.now().hour
    is_peak = 18 <= local_hour <= 21

    score = base_score
    peak_str = ""
    if is_peak:
        score = min(base_score + 15, 100.0)
        peak_str = " [DEMO/SIMULATED Evening Peak Hour +15 modifier applied (6 PM - 9 PM)]"

    # Speeding contributor: Speeding contributes to 70%+ crashes (2024)
    speeding_str = ""
    if density > w.high_density_threshold * 0.75:
        score = min(score + 10, 100.0)
        speeding_str = " [DEMO/SIMULATED Speeding risk contributor added (70%+ crashes reference)]"

    level_label = latest.traffic_level.value.upper()
    explanation = (
        f"Traffic level: {level_label}, "
        f"vehicle density: {density:.1f} veh/min "
        f"(threshold: {w.high_density_threshold})."
        f"{peak_str}{speeding_str}"
    )
    return round(score, 1), explanation


def calc_recent_incidents_factor(
    db: Session, junction: Junction, w: RiskWeights = WEIGHTS
) -> tuple[float, str]:
    """
    Count of ALL recent citizen-reported incidents (any type) near
    this junction in the look-back window.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(hours=w.incident_lookback_hours)
    incidents = (
        db.query(Incident)
        .filter(
            Incident.reported_at >= cutoff,
            Incident.status != IncidentStatus.DISMISSED,
        )
        .all()
    )
    nearby = sum(
        1 for inc in incidents
        if _haversine_km(junction.latitude, junction.longitude, inc.latitude, inc.longitude)
        <= w.nearby_radius_km
    )
    score = min(nearby / max(w.max_incidents_for_100, 1) * 100, 100.0)

    types_seen = set()
    for inc in incidents:
        if _haversine_km(junction.latitude, junction.longitude, inc.latitude, inc.longitude) <= w.nearby_radius_km:
            types_seen.add(inc.incident_type.value.replace("_", " "))

    type_str = ", ".join(sorted(types_seen)) if types_seen else "none"
    explanation = (
        f"{nearby} recent incident(s) nearby in last {w.incident_lookback_hours}h "
        f"(types: {type_str})"
    )
    return round(score, 1), explanation


def calc_road_obstruction_factor(
    db: Session, junction: Junction, w: RiskWeights = WEIGHTS
) -> tuple[float, str]:
    """
    Checks for active road-blocking incidents (ROAD_BLOCKED,
    VEHICLE_BREAKDOWN, ROAD_DAMAGE, WATERLOGGING) near the junction.
    """
    obstruction_types = {
        IncidentType.ROAD_BLOCKED,
        IncidentType.VEHICLE_BREAKDOWN,
        IncidentType.ROAD_DAMAGE,
        IncidentType.WATERLOGGING,
    }
    cutoff = datetime.now(timezone.utc) - timedelta(hours=w.incident_lookback_hours)
    obstructions = (
        db.query(Incident)
        .filter(
            Incident.incident_type.in_(obstruction_types),
            Incident.reported_at >= cutoff,
            Incident.status.in_([IncidentStatus.PENDING, IncidentStatus.VERIFIED, IncidentStatus.IN_PROGRESS]),
        )
        .all()
    )
    nearby = sum(
        1 for o in obstructions
        if _haversine_km(junction.latitude, junction.longitude, o.latitude, o.longitude)
        <= w.nearby_radius_km
    )
    # Even 1 active obstruction is significant
    score = min(nearby * 40.0, 100.0)

    if nearby == 0:
        explanation = "No active road obstructions nearby"
    else:
        explanation = f"{nearby} active road obstruction(s) within {w.nearby_radius_km} km"
    return round(score, 1), explanation


def calc_weather_factor(
    db: Session, junction: Junction, w: RiskWeights = WEIGHTS
) -> tuple[float, str]:
    """
    Simulated weather factor for the MVP.
    Checks for HEAVY_RAIN / WATERLOGGING incidents as a proxy for
    adverse weather conditions near the junction.

    NOTE: In production this would integrate a real weather API.
    """
    weather_types = {IncidentType.HEAVY_RAIN, IncidentType.WATERLOGGING}
    cutoff = datetime.now(timezone.utc) - timedelta(hours=6)
    reports = (
        db.query(Incident)
        .filter(
            Incident.incident_type.in_(weather_types),
            Incident.reported_at >= cutoff,
        )
        .all()
    )
    nearby = sum(
        1 for r in reports
        if _haversine_km(junction.latitude, junction.longitude, r.latitude, r.longitude)
        <= w.nearby_radius_km * 2  # wider radius for weather
    )
    score = min(nearby * 35.0, 100.0)
    if nearby == 0:
        explanation = "[SIMULATED] No adverse weather reports nearby"
    else:
        explanation = f"[SIMULATED] {nearby} weather-related report(s) within {w.nearby_radius_km * 2} km"
    return round(score, 1), explanation


def calc_police_coverage_gap_factor(
    db: Session, junction: Junction, w: RiskWeights = WEIGHTS
) -> tuple[float, str]:
    """
    How many available officers are near the junction vs. the
    required coverage level.
    """
    available_officers = (
        db.query(PoliceUnit)
        .filter(PoliceUnit.status == PoliceUnitStatus.AVAILABLE)
        .all()
    )
    nearby_count = sum(
        1 for o in available_officers
        if _haversine_km(junction.latitude, junction.longitude, o.latitude, o.longitude)
        <= w.nearby_radius_km
    )
    required = w.required_officers_per_junction
    gap = max(required - nearby_count, 0)
    score = min(gap / max(required, 1) * 100, 100.0)

    if gap == 0:
        explanation = (
            f"Coverage adequate: {nearby_count} officer(s) available "
            f"within {w.nearby_radius_km} km (required: {required})"
        )
    else:
        explanation = (
            f"Coverage gap: {nearby_count}/{required} officers available "
            f"within {w.nearby_radius_km} km (gap: {gap})"
        )
    return round(score, 1), explanation


# ═══════════════════════════════════════════════════════════
#  RESULT CONTAINER
# ═══════════════════════════════════════════════════════════
@dataclass
class RiskResult:
    """Complete output of the risk engine for one junction."""
    junction_id: str
    junction_name: str
    risk_score: float
    risk_level: RiskLevel
    key_factors: list[str]
    factor_values: dict[str, dict]  # factor_name → {score, weight, explanation}
    calculation_timestamp: str
    latitude: float
    longitude: float
    disclaimer: str = (
        "PROTOTYPE MODEL — This risk score is generated by a hackathon "
        "demo engine using simulated data. It is NOT scientifically "
        "validated and must NOT be used for real operational decisions."
    )


# ═══════════════════════════════════════════════════════════
#  MAIN CALCULATION
# ═══════════════════════════════════════════════════════════

# Factor registry: (name, calculator, weight_attr)
_FACTOR_REGISTRY = [
    ("historical_accident", calc_historical_accident_factor, "historical_accident"),
    ("current_traffic", calc_current_traffic_factor, "current_traffic"),
    ("recent_incidents", calc_recent_incidents_factor, "recent_incidents"),
    ("road_obstruction", calc_road_obstruction_factor, "road_obstruction"),
    ("weather", calc_weather_factor, "weather"),
    ("police_coverage_gap", calc_police_coverage_gap_factor, "police_coverage_gap"),
]


def calculate_risk(
    db: Session,
    junction: Junction,
    weights: RiskWeights = WEIGHTS,
) -> RiskResult:
    """
    Run the full risk calculation for a single junction.

    Returns a RiskResult with the final score, level, per-factor
    breakdown, and human-readable explanations of key risk drivers.
    """
    factor_values: dict[str, dict] = {}
    weighted_sum = 0.0
    key_factors: list[str] = []

    for name, calculator, weight_attr in _FACTOR_REGISTRY:
        weight = getattr(weights, weight_attr)
        score, explanation = calculator(db, junction, weights)
        contribution = score * weight
        weighted_sum += contribution

        factor_values[name] = {
            "raw_score": score,
            "weight": weight,
            "weighted_contribution": round(contribution, 1),
            "explanation": explanation,
        }

        # A factor is "key" if its raw score is ≥ 40 (notable)
        if score >= 40:
            key_factors.append(explanation)

    final_score = round(min(max(weighted_sum, 0), 100), 1)
    risk_level = score_to_risk_level(final_score)

    if not key_factors:
        key_factors.append("All factors within normal range")

    # Store calculated risk in history
    history_entry = RiskHistory(
        junction_id=junction.junction_id,
        risk_score=final_score,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(history_entry)
    db.commit()

    return RiskResult(
        junction_id=junction.junction_id,
        junction_name=junction.junction_name,
        risk_score=final_score,
        risk_level=risk_level,
        key_factors=key_factors,
        factor_values=factor_values,
        calculation_timestamp=datetime.now(timezone.utc).isoformat(),
        latitude=junction.latitude,
        longitude=junction.longitude,
    )


def calculate_risk_for_all(
    db: Session,
    weights: RiskWeights = WEIGHTS,
) -> list[RiskResult]:
    """Calculate risk for every junction in the database."""
    junctions = db.query(Junction).all()
    return [calculate_risk(db, j, weights) for j in junctions]


def determine_trend_direction(scores: list[float]) -> str:
    """
    Determine the trend direction from a list of chronological risk scores.
    Returns: INCREASING, DECREASING, or STABLE.
    """
    if len(scores) < 2:
        return "STABLE"

    first = scores[0]
    last = scores[-1]
    diff = last - first

    if diff > 1.5:
        return "INCREASING"
    elif diff < -1.5:
        return "DECREASING"
    else:
        return "STABLE"

