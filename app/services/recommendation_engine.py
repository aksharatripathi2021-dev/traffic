"""
NIRNAY – Police Recommendation Engine (Hackathon Prototype)
============================================================
DISCLAIMER: This is a **prototype deployment recommendation system**
built for a hackathon. It is NOT an official police dispatch or routing
engine. All response times and routing options are simulated.

Ranks and recommends available police officers for a junction based on:
1. Availability (status == AVAILABLE)
2. Geographic proximity (Haversine distance)
3. Coverage gap and risk score constraints
"""

from sqlalchemy.orm import Session

from app.models import Junction, PoliceUnit, PoliceUnitStatus
from app.services.distance_engine import calculate_haversine_distance
from app.services.coverage_engine import calculate_junction_coverage

# Configurable average response speed (assumed average urban patrol speed in km/h)
AVERAGE_SPEED_KMH = 20.0
MIN_RESPONSE_MINUTES = 2.0


def calculate_estimated_response_time(distance_km: float) -> float:
    """
    Calculate simulated response time in minutes based on distance
    and a configurable average patrol speed.
    """
    time_hours = distance_km / AVERAGE_SPEED_KMH
    time_minutes = time_hours * 60.0
    return round(max(time_minutes, MIN_RESPONSE_MINUTES), 1)


def get_recommendations_for_junction(
    db: Session,
    junction: Junction,
    risk_score: float,
) -> dict:
    """
    Rank available officers and recommend dispatch based on the junction's
    risk score and coverage gap.
    """
    # 1. Get coverage gap
    cov = calculate_junction_coverage(db, junction)
    coverage_gap = cov["coverage_gap"]

    # 2. Determine number of units to recommend based on gap and risk score
    if risk_score >= 80.0:  # CRITICAL
        num_to_recommend = max(coverage_gap, 2)
    elif risk_score >= 60.0:  # HIGH
        num_to_recommend = max(coverage_gap, 1)
    else:  # MEDIUM/LOW
        num_to_recommend = max(coverage_gap, 1)

    # 3. Find and rank available units
    available_units = (
        db.query(PoliceUnit)
        .filter(PoliceUnit.status == PoliceUnitStatus.AVAILABLE)
        .all()
    )

    ranked_officers = []
    for unit in available_units:
        dist = calculate_haversine_distance(
            junction.latitude,
            junction.longitude,
            unit.latitude,
            unit.longitude,
        )
        response_time = calculate_estimated_response_time(dist)
        ranked_officers.append(
            {
                "officer_id": unit.officer_id,
                "distance_km": dist,
                "estimated_response_minutes": response_time,
                "unit": unit,
            }
        )

    # Sort primarily by distance (closest first)
    ranked_officers.sort(key=lambda x: x["distance_km"])

    # 4. Generate recommendations up to num_to_recommend
    recommended_list = []
    selected_count = min(len(ranked_officers), num_to_recommend)

    for i in range(selected_count):
        item = ranked_officers[i]
        officer_id = item["officer_id"]
        dist = item["distance_km"]
        resp_time = item["estimated_response_minutes"]

        # Explainable reasoning
        reason = (
            f"[DEMO] Officer {officer_id} is recommended because they are available "
            f"and close ({dist:.1f} km away, estimated response: {resp_time} min). "
            f"Dispatched to address junction coverage gap ({coverage_gap}) and risk level."
        )

        recommended_list.append(
            {
                "officer_id": officer_id,
                "distance_km": dist,
                "estimated_response_minutes": resp_time,
                "reason": reason,
            }
        )

    return {
        "junction_id": junction.junction_id,
        "junction_name": junction.junction_name,
        "risk_score": risk_score,
        "coverage_gap": coverage_gap,
        "recommended_officers": recommended_list,
    }
