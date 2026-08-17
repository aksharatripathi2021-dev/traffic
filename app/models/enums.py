"""
NIRNAY – Enumeration Types

Centralised enums used across ORM models and Pydantic schemas.
"""

import enum


class IncidentType(str, enum.Enum):
    """Types of traffic incidents citizens can report."""
    ACCIDENT = "accident"
    ROAD_BLOCKED = "road_blocked"
    WATERLOGGING = "waterlogging"
    HEAVY_RAIN = "heavy_rain"
    HEAVY_CONGESTION = "heavy_congestion"
    TRAFFIC_VIOLATION = "traffic_violation"
    ROAD_HAZARD = "road_hazard"
    SIGNAL_FAILURE = "signal_failure"
    VEHICLE_BREAKDOWN = "vehicle_breakdown"
    ROAD_DAMAGE = "road_damage"
    OTHER = "other"


class IncidentStatus(str, enum.Enum):
    """Lifecycle status of a reported incident."""
    PENDING = "pending"
    VERIFIED = "verified"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class TrafficLevel(str, enum.Enum):
    """Qualitative traffic congestion level."""
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class RiskLevel(str, enum.Enum):
    """Risk classification for a junction / zone."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RoadType(str, enum.Enum):
    """Classification of road at a junction."""
    HIGHWAY = "highway"
    ARTERIAL = "arterial"
    COLLECTOR = "collector"
    LOCAL = "local"


class PoliceUnitStatus(str, enum.Enum):
    """Availability status of a police unit / officer."""
    AVAILABLE = "available"
    ON_DUTY = "on_duty"
    OFF_DUTY = "off_duty"
    ON_BREAK = "on_break"


class DeploymentStatus(str, enum.Enum):
    """Status of an AI-generated deployment recommendation."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    MODIFIED = "modified"
    REJECTED = "rejected"


class UserRole(str, enum.Enum):
    """Application roles for access control."""
    CITIZEN = "citizen"
    POLICE = "police"
