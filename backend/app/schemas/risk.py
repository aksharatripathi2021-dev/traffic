"""
NIRNAY – Risk Pydantic Schemas

Response models for the risk engine API endpoints.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import RiskLevel


class FactorDetail(BaseModel):
    """Breakdown of a single risk factor."""
    raw_score: float = Field(..., ge=0, le=100, description="Normalised factor score 0–100")
    weight: float = Field(..., description="Weight applied to this factor")
    weighted_contribution: float = Field(..., description="raw_score * weight")
    explanation: str = Field(..., description="Human-readable explanation")


class JunctionRiskResponse(BaseModel):
    """Full risk assessment for one junction."""
    junction_id: str
    junction_name: str
    risk_score: float = Field(..., ge=0, le=100, description="Overall risk score 0–100")
    risk_level: RiskLevel
    key_factors: list[str] = Field(
        ..., description="Human-readable explanations of the top risk drivers"
    )
    factor_values: dict[str, FactorDetail] = Field(
        ..., description="Per-factor breakdown with scores, weights, and explanations"
    )
    calculation_timestamp: str
    latitude: float
    longitude: float
    disclaimer: str

    model_config = {"from_attributes": True}


class RiskMapEntry(BaseModel):
    """Lightweight risk summary for the heatmap overlay."""
    junction_id: str
    junction_name: str
    latitude: float
    longitude: float
    risk_score: float
    risk_level: RiskLevel
    key_factors: list[str]

    model_config = {"from_attributes": True}


class RiskMapResponse(BaseModel):
    """Complete risk heatmap data for all junctions."""
    total_junctions: int
    calculation_timestamp: str
    disclaimer: str
    junctions: list[RiskMapEntry]


class RiskHistoryPoint(BaseModel):
    """A single historical risk score data point."""
    timestamp: datetime
    risk_score: float

    model_config = {"from_attributes": True}


class JunctionRiskTrendResponse(BaseModel):
    """Historical risk trend analysis for a junction."""
    junction_id: str
    junction_name: str
    history: list[RiskHistoryPoint]
    trend_direction: str  # INCREASING, DECREASING, STABLE
    disclaimer: str

    model_config = {"from_attributes": True}
