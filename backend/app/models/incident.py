"""
NIRNAY – Incident Model

Represents a citizen-reported traffic incident.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base
from app.models.enums import IncidentType, IncidentStatus


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_type = Column(Enum(IncidentType), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    photo_path = Column(String(500), nullable=True)
    reported_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    status = Column(
        Enum(IncidentStatus),
        nullable=False,
        default=IncidentStatus.PENDING,
    )
    reported_by = Column(
        Integer, ForeignKey("users.id"), nullable=True, index=True
    )

    # Relationships
    reporter = relationship("User", foreign_keys=[reported_by])

    def __repr__(self) -> str:
        return f"<Incident {self.id}: {self.incident_type.value} [{self.status.value}]>"
