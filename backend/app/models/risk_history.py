"""
NIRNAY – RiskHistory Model

Stores historical risk-score snapshots for trend analysis.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class RiskHistory(Base):
    __tablename__ = "risk_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    junction_id = Column(
        String(20), ForeignKey("junctions.junction_id"), nullable=False, index=True
    )
    risk_score = Column(Float, nullable=False)  # 0.0 – 100.0
    timestamp = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    junction = relationship("Junction", back_populates="risk_history")

    def __repr__(self) -> str:
        return f"<RiskHistory {self.junction_id}: {self.risk_score}>"
