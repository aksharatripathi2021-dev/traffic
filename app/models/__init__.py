"""
NIRNAY – ORM Models Package

Imports all models so SQLAlchemy's Base.metadata sees every table
when create_tables() is called.
"""

from app.models.enums import (
    IncidentType,
    IncidentStatus,
    TrafficLevel,
    RiskLevel,
    RoadType,
    PoliceUnitStatus,
    DeploymentStatus,
    UserRole,
)

from app.models.zone import Zone
from app.models.junction import Junction
from app.models.incident import Incident
from app.models.traffic import Traffic, TrafficSignal
from app.models.risk_score import RiskScore
from app.models.risk_history import RiskHistory
from app.models.police_unit import PoliceUnit
from app.models.deployment_recommendation import DeploymentRecommendation
from app.models.user import User

__all__ = [
    # Enums
    "IncidentType",
    "IncidentStatus",
    "TrafficLevel",
    "RiskLevel",
    "RoadType",
    "PoliceUnitStatus",
    "DeploymentStatus",
    "UserRole",
    # Models
    "Zone",
    "Junction",
    "Incident",
    "Traffic",
    "TrafficSignal",
    "RiskScore",
    "RiskHistory",
    "PoliceUnit",
    "DeploymentRecommendation",
    "User",
]
