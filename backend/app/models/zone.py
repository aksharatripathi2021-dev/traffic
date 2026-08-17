"""
NIRNAY – Zone Model

Represents a geographic zone in Nagpur City.
"""

from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship

from app.database.base import Base


class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, autoincrement=True)
    zone_id = Column(String(20), unique=True, nullable=False, index=True)
    zone_name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    # Relationships
    junctions = relationship("Junction", back_populates="zone")

    def __repr__(self) -> str:
        return f"<Zone {self.zone_id}: {self.zone_name}>"
