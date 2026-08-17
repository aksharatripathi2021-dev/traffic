"""
NIRNAY – RiskScore Model

Stores the latest computed risk score for a junction.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base
from app.models.enums import RiskLevel


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    junction_id = Column(
        String(20), ForeignKey("junctions.junction_id"), nullable=False, index=True
    )
    score = Column(Float, nullable=False)  # 0.0 – 100.0
    risk_level = Column(Enum(RiskLevel), nullable=False)
    calculated_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    junction = relationship("Junction", back_populates="risk_scores")

    def __repr__(self) -> str:
        return f"<RiskScore {self.junction_id}: {self.score} ({self.risk_level.value})>"
