"""
NIRNAY – Recommendation Pydantic Schemas

Response models for the deployment recommendation API.
"""

from pydantic import BaseModel, Field


class RecommendedOfficer(BaseModel):
    """Detailed recommendation details for a single officer."""
    officer_id: str = Field(..., description="Unique ID of the recommended officer")
    distance_km: float = Field(..., description="Geographic distance in kilometers")
    estimated_response_minutes: float = Field(
        ..., description="Simulated estimated response time based on patrol speed"
    )
    reason: str = Field(..., description="Explainable reason log")


class RecommendationResponse(BaseModel):
    """Deployment suggestions response for a junction."""
    junction_id: str
    junction_name: str
    risk_score: float
    coverage_gap: int
    recommended_officers: list[RecommendedOfficer]
    disclaimer: str
