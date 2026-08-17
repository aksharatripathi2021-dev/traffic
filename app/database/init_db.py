"""
NIRNAY – Database Initialization

Creates all tables and optionally seeds demo data.
"""

from app.database.base import Base
from app.database.session import engine

# Side-effect import: registers every model with Base.metadata
import app.models  # noqa: F401


def init_db() -> None:
    """Create all tables defined by ORM models (idempotent)."""
    Base.metadata.create_all(bind=engine)
    print("[NIRNAY] Database tables created / verified.")


def drop_db() -> None:
    """Drop all tables (use only in development)."""
    Base.metadata.drop_all(bind=engine)
    print("[NIRNAY] All database tables dropped.")


def reset_db() -> None:
    """Drop and recreate all tables, then seed demo data."""
    drop_db()
    init_db()

    from app.database.seed import seed_demo_data
    seed_demo_data()
    print("[NIRNAY] Database reset complete with demo data.")
