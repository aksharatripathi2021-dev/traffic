"""
NIRNAY – Deployment Decision Pydantic Schemas

Request and response schemas for police deployment recommendation decisions.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.models.enums import DeploymentStatus


class DeploymentModifyRequest(BaseModel):
    """Payload for modifying a deployment recommendation."""
    selected_officers: list[str] = Field(
        ...,
        min_items=1,
        description="List of officer IDs selected to cover the junction",
        examples=[["OFR-007", "OFR-012"]],
    )
    modification_reason: Optional[str] = Field(
        None,
        max_length=500,
        description="Reason explaining the modifications made",
        examples=["Changing to OFR-012 as OFR-007 is redirecting traffic at Varieties Square"],
    )


class DeploymentRejectRequest(BaseModel):
    """Payload for rejecting a deployment recommendation."""
    rejection_reason: Optional[str] = Field(
        None,
        max_length=500,
        description="Explanation for rejecting the recommendation",
        examples=["Local unit already handled the signal congestion"],
    )


class DeploymentDecisionResponse(BaseModel):
    """Returned after successfully updating recommendation status."""
    id: int
    junction_id: str
    officer_id: str
    status: DeploymentStatus
    decided_by: int
    decided_at: datetime
    selected_officers: Optional[str] = None
    modification_reason: Optional[str] = None
    message: str

    model_config = {"from_attributes": True}
