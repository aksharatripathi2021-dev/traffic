"""
NIRNAY – Authentication Utilities

Password hashing (bcrypt), JWT creation / verification,
and FastAPI dependencies for extracting the current user and
enforcing role-based access.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.auth import TokenData
from app.utils.config import get_settings

settings = get_settings()


# ── Password hashing (bcrypt directly) ──────────────────
def hash_password(plain: str) -> str:
    """Return a bcrypt hash of the plaintext password."""
    pwd_bytes = plain.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Check a plaintext password against a stored hash."""
    return bcrypt.checkpw(
        plain.encode("utf-8"),
        hashed.encode("utf-8"),
    )


# ── JWT helpers ──────────────────────────────────────────
def create_access_token(
    user_id: int,
    username: str,
    role: UserRole,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a signed JWT containing user claims."""
    expire = datetime.now(timezone.utc) + (
        expires_delta
        or timedelta(minutes=settings.jwt_access_token_expire_minutes)
    )
    payload = {
        "sub": str(user_id),
        "username": username,
        "role": role.value,
        "exp": expire,
    }
    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> TokenData:
    """Decode and validate a JWT, returning structured claims."""
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        user_id: int = int(payload.get("sub", 0))
        username: str = payload.get("username", "")
        role: str = payload.get("role", "")

        if not user_id or not username or not role:
            raise JWTError("Incomplete token payload")

        return TokenData(
            user_id=user_id,
            username=username,
            role=UserRole(role),
        )
    except (JWTError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


# ── OAuth2 scheme (reads Authorization: Bearer <token>) ─
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ── FastAPI dependencies ─────────────────────────────────
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency: extract and validate the JWT, then load the User
    from the database. Raises 401 if the token is invalid or the
    user no longer exists / is deactivated.
    """
    token_data = decode_access_token(token)

    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )

    return user


def require_role(*allowed_roles: UserRole):
    """
    Factory that returns a dependency enforcing role-based access.

    Usage in a route:
        @router.get("/police-only", dependencies=[Depends(require_role(UserRole.POLICE))])
    Or as a parameter:
        current_user: User = Depends(require_role(UserRole.POLICE))
    """

    def _role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Access denied. Required role(s): "
                    f"{', '.join(r.value for r in allowed_roles)}. "
                    f"Your role: {current_user.role.value}."
                ),
            )
        return current_user

    return _role_checker
