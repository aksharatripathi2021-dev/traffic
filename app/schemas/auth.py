"""
NIRNAY – Auth Pydantic Schemas

Request / response models for registration, login, and token payloads.
Passwords are NEVER included in any response schema.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import UserRole


# ── Registration ─────────────────────────────────────────
class UserRegisterRequest(BaseModel):
    """Citizen self-registration request."""
    username: str = Field(..., min_length=3, max_length=50, examples=["rahul_nagpur"])
    email: EmailStr = Field(..., examples=["rahul@example.com"])
    password: str = Field(..., min_length=6, max_length=128, examples=["securePass123"])
    full_name: str = Field(..., min_length=2, max_length=100, examples=["Rahul Sharma"])


class UserRegisterResponse(BaseModel):
    """Returned after successful registration. No password exposed."""
    id: int
    username: str
    email: str
    full_name: str
    role: UserRole
    message: str

    model_config = {"from_attributes": True}


# ── Login ────────────────────────────────────────────────
class LoginRequest(BaseModel):
    """Credentials for login (citizens and police)."""
    username: str = Field(..., examples=["demo_police"])
    password: str = Field(..., examples=["nirnay2026"])


class TokenResponse(BaseModel):
    """JWT token returned on successful login."""
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    username: str
    message: str


# ── Token payload (internal) ─────────────────────────────
class TokenData(BaseModel):
    """Decoded JWT claims (not sent to clients directly)."""
    user_id: int
    username: str
    role: UserRole


# ── Current user info ────────────────────────────────────
class CurrentUserResponse(BaseModel):
    """Profile of the currently authenticated user."""
    id: int
    username: str
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Generic error ────────────────────────────────────────
class AuthErrorResponse(BaseModel):
    """Standard error body for auth failures."""
    detail: str
