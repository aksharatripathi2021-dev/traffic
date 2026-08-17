"""
NIRNAY – Police Coverage Engine (Hackathon Prototype)
=====================================================
DISCLAIMER: This is a **prototype coverage calculator** for a hackathon.
It is NOT an official police deployment tool.

Calculates police unit coverage for junctions and zones in Nagpur.
"""

from math import radians, sin, cos, sqrt, atan2
from sqlalchemy.orm import Session

from app.models import Junction, Zone, PoliceUnit, RoadType, PoliceUnitStatus

# ── Bounding / search parameters ─────────────────────────
NEARBY_RADIUS_KM = 2.0
ZONE_RADIUS_KM = 3.0


# ── DEMO/SIMULATED district fatality numbers from Maharashtra Road Crash Reports (2022, 2024) ──
# Nagpur Rural (492 in 2022), Nashik Rural (1031 in 2024), Nagpur City (310 in 2022)
DEMO_DISTRICT_FATALITIES = {
    "Nagpur Rural": 492,
    "Nashik Rural": 1031,
    "Nagpur City": 310
}

def get_demo_district_for_zone(zone_id: str) -> str:
    """Map zone to a simulated district to fetch demo crash statistics."""
    if zone_id in {"ZN-04", "ZN-07"}:
        return "Nagpur Rural"
    if zone_id == "ZN-03":
        return "Nashik Rural"
    return "Nagpur City"


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two GPS points in kilometres."""
    R = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


def get_required_coverage_for_junction(road_type: RoadType) -> int:
    """Map road type to required police presence."""
    if road_type == RoadType.HIGHWAY:
        return 3
    elif road_type == RoadType.ARTERIAL:
        return 2
    return 1


def calculate_junction_coverage(db: Session, junction: Junction) -> dict:
    """
    Calculate current, required, and gap coverage for a junction.
    Consider active police units (AVAILABLE or ON_DUTY) within NEARBY_RADIUS_KM.
    """
    active_statuses = {PoliceUnitStatus.AVAILABLE, PoliceUnitStatus.ON_DUTY}
    active_units = (
        db.query(PoliceUnit)
        .filter(PoliceUnit.status.in_(active_statuses))
        .all()
    )

    current_coverage = sum(
        1 for u in active_units
        if _haversine_km(junction.latitude, junction.longitude, u.latitude, u.longitude)
        <= NEARBY_RADIUS_KM
    )

    required_coverage = get_required_coverage_for_junction(junction.road_type)
    coverage_gap = max(required_coverage - current_coverage, 0)
    coverage_status = "ADEQUATE" if coverage_gap == 0 else "UNDER_COVERED"

    return {
        "current_coverage": current_coverage,
        "required_coverage": required_coverage,
        "coverage_gap": coverage_gap,
        "coverage_status": coverage_status,
    }


def calculate_zone_coverage(db: Session, zone: Zone) -> dict:
    """
    Calculate coverage details for a Zone based on the junctions inside it.
    Integrates DEMO indicators from Maharashtra Road Crash Reports.
    """
    junctions = db.query(Junction).filter(Junction.zone_id == zone.zone_id).all()

    # Fatality-based required coverage adjustment as a DEMO indicator
    district = get_demo_district_for_zone(zone.zone_id)
    fatalities = DEMO_DISTRICT_FATALITIES.get(district, 310)

    # Nagpur Rural (492 fatalities -> +1 required officer), Nashik Rural (1031 fatalities -> +2 required officers)
    fatality_modifier = 0
    if fatalities > 1000:
        fatality_modifier = 2
    elif fatalities > 400:
        fatality_modifier = 1

    # Required coverage is the sum of requirements of all junctions in the zone + DEMO fatality modifier
    required_coverage = sum(
        get_required_coverage_for_junction(j.road_type) for j in junctions
    ) + fatality_modifier

    # Current coverage is the number of active units within ZONE_RADIUS_KM of the zone centroid
    active_statuses = {PoliceUnitStatus.AVAILABLE, PoliceUnitStatus.ON_DUTY}
    active_units = (
        db.query(PoliceUnit)
        .filter(PoliceUnit.status.in_(active_statuses))
        .all()
    )

    current_coverage = sum(
        1 for u in active_units
        if _haversine_km(zone.latitude, zone.longitude, u.latitude, u.longitude)
        <= ZONE_RADIUS_KM
    )

    coverage_gap = max(required_coverage - current_coverage, 0)
    coverage_status = "ADEQUATE" if coverage_gap == 0 else "UNDER_COVERED"

    return {
        "current_coverage": current_coverage,
        "required_coverage": required_coverage,
        "coverage_gap": coverage_gap,
        "coverage_status": coverage_status,
    }
