"""
NIRNAY – Database Session Management

Creates the SQLAlchemy engine & session factory and exposes a
FastAPI-compatible dependency (`get_db`).
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.utils.config import get_settings
from app.database.base import Base

settings = get_settings()

# ── Engine ───────────────────────────────────────────────
# SQLite needs `check_same_thread=False` when used with FastAPI's
# async request handling (threads ≠ the creating thread).
_connect_args = {}
if settings.database_url.startswith("sqlite"):
    _connect_args["check_same_thread"] = False

engine = create_engine(
    settings.database_url,
    connect_args=_connect_args,
    echo=settings.debug,  # SQL logging in dev
)

# ── Session factory ──────────────────────────────────────
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ── FastAPI dependency ───────────────────────────────────
def get_db() -> Generator[Session, None, None]:
    """Yield a DB session and guarantee cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables() -> None:
    """Create all tables that inherit from Base (idempotent)."""
    Base.metadata.create_all(bind=engine)
