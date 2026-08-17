"""
NIRNAY – Police operational dashboard response models.
"""

from typing import Optional
from pydantic import BaseModel, Field

from app.models.enums import RiskLevel, PoliceUnitStatus


class JunctionInfo(BaseModel):
    """Details of a junction inside the zone."""
    junction_id: str
    junction_name: str
    road_type: str
    latitude: float
    longitude: float


class ZoneInfo(BaseModel):
    """Geographic and temporal zone data."""
    zone_name: str
    zone_id: str
    junctions: list[JunctionInfo]
    current_time: str
    last_data_update: str


class RiskInfo(BaseModel):
    """Zone risk parameters."""
    score: float
    risk_level: RiskLevel
    trend: str  # INCREASING, DECREASING, STABLE
    key_factors: list[str]


class CoverageInfo(BaseModel):
    """Zone-wide coverage calculations."""
    current_coverage: int
    required_coverage: int
    coverage_gap: int
    status: str  # ADEQUATE, UNDER_COVERED


class NearbyOfficer(BaseModel):
    """An available patrol unit close to the zone."""
    officer_id: str
    distance: float = Field(..., description="Distance in kilometers")
    estimated_response_time: float = Field(..., description="Estimated response time in minutes")
    availability: PoliceUnitStatus


class RecommendationInfo(BaseModel):
    """AI responders recommendation."""
    recommended_officers: list[str]
    estimated_response: str
    explanation: str


class PoliceZoneDetailResponse(BaseModel):
    """Complete zone details operational view response."""
    zone: ZoneInfo
    risk: RiskInfo
    coverage: CoverageInfo
    nearby_officers: list[NearbyOfficer]
    recommendation: Optional[RecommendationInfo] = None
    disclaimer: str
