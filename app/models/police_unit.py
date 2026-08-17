"""
NIRNAY – PoliceUnit Model

Represents an individual police officer / patrol unit.
"""

from sqlalchemy import Column, Integer, String, Float, Enum

from app.database.base import Base
from app.models.enums import PoliceUnitStatus


class PoliceUnit(Base):
    __tablename__ = "police_units"

    id = Column(Integer, primary_key=True, autoincrement=True)
    officer_id = Column(String(20), unique=True, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(
        Enum(PoliceUnitStatus),
        nullable=False,
        default=PoliceUnitStatus.AVAILABLE,
    )

    def __repr__(self) -> str:
        return f"<PoliceUnit {self.officer_id} [{self.status.value}]>"
