import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup test environment variables before importing app modules
os.environ["DATABASE_URL"] = "sqlite:///./test_nirnay.db"
os.environ["JWT_SECRET_KEY"] = "test_super_secret_key_123_456"

from app.main import app
from app.database import get_db, Base
from app.database.seed import seed_demo_data

# Create test engine and session factory
test_engine = create_engine("sqlite:///./test_nirnay.db", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Create test tables, seed initial demo Nagpur dataset, and cleanup afterwards."""
    # Ensure a clean database for tests
    if os.path.exists("./test_nirnay.db"):
        os.remove("./test_nirnay.db")

    # Create tables
    Base.metadata.create_all(bind=test_engine)

    # Seed demo data in the test DB
    # Since seed_demo_data imports SessionLocal from app.database.session,
    # let's temporarily patch it to use test_engine.
    import app.database.session
    original_engine = app.database.session.engine
    original_sessionmaker = app.database.session.SessionLocal
    app.database.session.engine = test_engine
    app.database.session.SessionLocal = TestingSessionLocal

    try:
        seed_demo_data()
    finally:
        app.database.session.engine = original_engine
        app.database.session.SessionLocal = original_sessionmaker

    yield

    # Teardown: Clean up the test database file
    if os.path.exists("./test_nirnay.db"):
        try:
            os.remove("./test_nirnay.db")
        except Exception:
            pass


@pytest.fixture
def db_session():
    """Exposes a clean session wrapper for DB direct asserts."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(autouse=True)
def override_db_dependency():
    """Overrides the FastAPI get_db dependency for all request contexts."""
    def _override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()
    app.dependency_overrides[get_db] = _override_get_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    """Exposes a FastAPI TestClient instance."""
    with TestClient(app) as c:
        yield c
