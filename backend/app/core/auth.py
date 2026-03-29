"""Supabase JWT verification middleware.

Verifies the Supabase JWT and returns the authenticated user_id.
Use as a FastAPI dependency: `user_id: str = Depends(get_current_user)`.
"""
import base64

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from app.core.config import settings

security = HTTPBearer()


def _get_jwt_key() -> bytes:
    """Return the JWT signing key as bytes.

    Supabase displays the JWT secret as a base64-encoded string in the dashboard.
    python-jose needs the decoded bytes for HS256 verification.
    Falls back to the anon key (also base64) if jwt secret not set.
    """
    raw = settings.supabase_jwt_secret or settings.supabase_anon_key
    try:
        # Supabase JWT secret is base64-encoded — decode to raw bytes
        return base64.b64decode(raw)
    except Exception:
        # If decoding fails, use the string directly as bytes
        return raw.encode("utf-8")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """Verify the Supabase JWT and return the user_id (sub claim).

    Raises:
        HTTPException 401: if token is missing, malformed, or invalid.
    """
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            _get_jwt_key(),
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return user_id
    except JWTError:
        raise credentials_exception
