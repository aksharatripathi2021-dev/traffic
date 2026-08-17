"""
NIRNAY – Traffic Model

Stores real-time traffic readings at a junction.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base
from app.models.enums import TrafficLevel


class Traffic(Base):
    __tablename__ = "traffic"

    id = Column(Integer, primary_key=True, autoincrement=True)
    junction_id = Column(
        String(20), ForeignKey("junctions.junction_id"), nullable=False, index=True
    )
    traffic_level = Column(Enum(TrafficLevel), nullable=False)
    vehicle_density = Column(Float, nullable=False)  # vehicles per minute
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    junction = relationship("Junction", back_populates="traffic_records")

    def __repr__(self) -> str:
        return f"<Traffic {self.junction_id}: {self.traffic_level.value}>"


class TrafficSignal(Base):
    __tablename__ = "traffic_signals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    zone_name = Column(String(100), nullable=False, index=True)
    intersections = Column(Integer, nullable=False)
    signalized_intersections = Column(Integer, nullable=False)

    def __repr__(self) -> str:
        return f"<TrafficSignal {self.zone_name}: {self.signalized_intersections}/{self.intersections}>"
