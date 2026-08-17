"""
NIRNAY – Junction Model

Represents a traffic junction within a zone.
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.database.base import Base
from app.models.enums import RoadType


class Junction(Base):
    __tablename__ = "junctions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    junction_id = Column(String(20), unique=True, nullable=False, index=True)
    junction_name = Column(String(150), nullable=False)
    zone_id = Column(String(20), ForeignKey("zones.zone_id"), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    road_type = Column(Enum(RoadType), nullable=False, default=RoadType.LOCAL)

    # Relationships
    zone = relationship("Zone", back_populates="junctions")
    traffic_records = relationship("Traffic", back_populates="junction")
    risk_scores = relationship("RiskScore", back_populates="junction")
    risk_history = relationship("RiskHistory", back_populates="junction")
    deployment_recommendations = relationship(
        "DeploymentRecommendation", back_populates="junction"
    )

    def __repr__(self) -> str:
        return f"<Junction {self.junction_id}: {self.junction_name}>"

    @property
    def traffic_signal(self):
        """Link to TRAFFIC_SIGNAL by matching zone_name (e.g. Sitabuldi Chowk/Zone)."""
        from app.models.traffic import TrafficSignal
        from sqlalchemy import inspect, func
        session = inspect(self).session
        if not session or not self.zone:
            return None
        # Clean: '[DEMO] Sitabuldi' -> 'sitabuldi'
        clean_zone = self.zone.zone_name.replace("[DEMO] ", "").lower().strip()
        # Find TrafficSignal where TrafficSignal.zone_name contains clean_zone
        return session.query(TrafficSignal).filter(
            func.lower(TrafficSignal.zone_name).contains(clean_zone)
        ).first()
