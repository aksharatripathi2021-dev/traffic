"""
NIRNAY – SQLAlchemy Declarative Base

All ORM models inherit from `Base` defined here.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """SQLAlchemy declarative base for all NIRNAY models."""
    pass
