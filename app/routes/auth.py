"""
NIRNAY – Authentication Routes

POST /api/auth/register  – Citizen self-registration
POST /api/auth/login     – Login for all roles (citizen & police)
GET  /api/auth/me        – Get current user profile (protected)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.auth import (
    UserRegisterRequest,
    UserRegisterResponse,
    LoginRequest,
    TokenResponse,
    CurrentUserResponse,
    AuthErrorResponse,
)
from app.utils.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── POST /api/auth/register ─────────────────────────────
@router.post(
    "/register",
    response_model=UserRegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new citizen account",
    description="Creates a new **CITIZEN** account. Police accounts are "
                "provisioned internally and cannot be self-registered.",
    responses={
        409: {"model": AuthErrorResponse, "description": "Username or email already taken"},
    },
)
def register(
    body: UserRegisterRequest,
    db: Session = Depends(get_db),
) -> UserRegisterResponse:
    # Check for duplicate username
    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Username '{body.username}' is already registered.",
        )

    # Check for duplicate email
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Email '{body.email}' is already registered.",
        )

    user = User(
        username=body.username,
        email=body.email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name,
        role=UserRole.CITIZEN,  # self-registration is always CITIZEN
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserRegisterResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        message="Citizen account created successfully.",
    )


# ── POST /api/auth/login ────────────────────────────────
@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login (citizen or police)",
    description="Authenticates a user and returns a JWT access token. "
                "Works for both CITIZEN and POLICE roles.",
    responses={
        401: {"model": AuthErrorResponse, "description": "Invalid credentials"},
        403: {"model": AuthErrorResponse, "description": "Account deactivated"},
    },
)
def login(
    body: LoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    user = db.query(User).filter(User.username == body.username).first()

    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Contact an administrator.",
        )

    token = create_access_token(
        user_id=user.id,
        username=user.username,
        role=user.role,
    )

    return TokenResponse(
        access_token=token,
        role=user.role,
        username=user.username,
        message=f"Welcome back, {user.full_name}!",
    )


# ── GET /api/auth/me ────────────────────────────────────
@router.get(
    "/me",
    response_model=CurrentUserResponse,
    summary="Get current user profile",
    description="Returns the profile of the currently authenticated user. "
                "Requires a valid JWT in the Authorization header.",
    responses={
        401: {"model": AuthErrorResponse, "description": "Not authenticated"},
    },
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> CurrentUserResponse:
    return CurrentUserResponse.model_validate(current_user)
