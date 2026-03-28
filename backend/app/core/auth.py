"""Supabase JWT verification middleware.

Verifies the Supabase JWT and returns the authenticated user_id.
Use as a FastAPI dependency: `user_id: str = Depends(get_current_user)`.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from app.core.config import settings

security = HTTPBearer()


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
        # Supabase user JWTs are signed with the project JWT secret.
        # Find it at: Supabase dashboard → Settings → API → JWT Secret
        jwt_secret = settings.supabase_jwt_secret or settings.supabase_anon_key
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return user_id
    except JWTError:
        raise credentials_exception
