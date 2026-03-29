"""Supabase JWT verification middleware.

Verifies the Supabase JWT by calling supabase.auth.get_user(token).
This is the official approach — no manual JWT secret handling needed.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import create_client, Client
from app.core.config import settings

security = HTTPBearer()

_supabase: Client = create_client(settings.supabase_url, settings.supabase_anon_key)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """Verify the Supabase JWT via get_user() and return the user_id.

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
        response = _supabase.auth.get_user(token)
        if not response or not response.user:
            raise credentials_exception
        return response.user.id
    except Exception:
        raise credentials_exception
