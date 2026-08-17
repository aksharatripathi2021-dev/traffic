"""
NIRNAY – DeploymentRecommendation Model

Stores AI-generated officer deployment suggestions for a junction,
along with police decision logs (accept / modify / reject audit details).
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base
from app.models.enums import DeploymentStatus


class DeploymentRecommendation(Base):
    __tablename__ = "deployment_recommendations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    junction_id = Column(
        String(20), ForeignKey("junctions.junction_id"), nullable=False, index=True
    )
    officer_id = Column(
        String(20), ForeignKey("police_units.officer_id"), nullable=False, index=True
    )
    distance_km = Column(Float, nullable=False)
    estimated_response_minutes = Column(Float, nullable=False)
    reason = Column(String(500), nullable=False)
    status = Column(
        Enum(DeploymentStatus),
        nullable=False,
        default=DeploymentStatus.PENDING,
    )
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # ── Police decision audit fields ─────────────────────
    decided_by = Column(
        Integer, ForeignKey("users.id"), nullable=True, index=True
    )
    decided_at = Column(DateTime(timezone=True), nullable=True)
    selected_officers = Column(
        String(255),
        nullable=True,
    )  # Comma-separated list of selected officer IDs on decision
    modification_reason = Column(
        String(500),
        nullable=True,
    )  # Optional reason text supplied if recommendation was modified/rejected

    # Relationships
    junction = relationship("Junction", back_populates="deployment_recommendations")
    officer = relationship("PoliceUnit")
    decided_by_user = relationship("User", foreign_keys=[decided_by])

    def __repr__(self) -> str:
        return (
            f"<DeploymentRecommendation junction={self.junction_id} "
            f"officer={self.officer_id} [{self.status.value}]>"
        )
