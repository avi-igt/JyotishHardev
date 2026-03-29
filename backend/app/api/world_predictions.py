"""World predictions endpoints.

Public:
  GET /public/predictions — list all predictions with accuracy stats (no auth)

Admin (requires authenticated user whose email matches settings.admin_email):
  POST /admin/predictions          — create a prediction
  PATCH /admin/predictions/{id}    — update prediction status
"""
import uuid
from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.auth import _supabase
from app.core.config import settings
from app.core.db import get_db
from app.models.world_prediction import WorldPrediction, PredictionStatus

router = APIRouter(tags=["world_predictions"])

_bearer = HTTPBearer()


# ─── Schemas ─────────────────────────────────────────────────────────────────


class WorldPredictionOut(BaseModel):
    id: str
    topic: str
    prediction_text: str
    target_date: Optional[date]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class PredictionsResponse(BaseModel):
    predictions: list[WorldPredictionOut]
    total: int
    confirmed_count: int
    accuracy_pct: Optional[float]  # None if no non-pending predictions


class CreatePredictionRequest(BaseModel):
    topic: str
    prediction_text: str
    target_date: Optional[date] = None
    status: PredictionStatus = PredictionStatus.pending


class UpdatePredictionRequest(BaseModel):
    status: PredictionStatus


# ─── Admin dependency ─────────────────────────────────────────────────────────


def get_admin_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> str:
    """Verify the bearer token via Supabase and confirm the user is the admin.

    Returns the user_id on success.
    Raises 401 if token is invalid, 403 if the user is not the admin.
    """
    token = credentials.credentials

    try:
        response = _supabase.auth.get_user(token)
        if not response or not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user = response.user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not settings.admin_email or user.email != settings.admin_email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return user.id


# ─── Endpoints ────────────────────────────────────────────────────────────────


@router.get("/public/predictions", response_model=PredictionsResponse)
def list_predictions(db: Session = Depends(get_db)) -> PredictionsResponse:
    """Return all world predictions sorted by created_at DESC with accuracy stats.

    No auth required.
    """
    predictions = (
        db.query(WorldPrediction)
        .order_by(WorldPrediction.created_at.desc())
        .all()
    )

    total = len(predictions)
    confirmed_count = sum(1 for p in predictions if p.status == PredictionStatus.confirmed)

    # accuracy_pct is None if there are no non-pending predictions
    non_pending = [p for p in predictions if p.status != PredictionStatus.pending]
    if non_pending:
        accuracy_pct = round(
            sum(1 for p in non_pending if p.status == PredictionStatus.confirmed)
            / len(non_pending)
            * 100,
            1,
        )
    else:
        accuracy_pct = None

    return PredictionsResponse(
        predictions=[WorldPredictionOut.model_validate(p) for p in predictions],
        total=total,
        confirmed_count=confirmed_count,
        accuracy_pct=accuracy_pct,
    )


@router.post(
    "/admin/predictions",
    response_model=WorldPredictionOut,
    status_code=status.HTTP_201_CREATED,
)
def create_prediction(
    body: CreatePredictionRequest,
    db: Session = Depends(get_db),
    _admin_id: str = Depends(get_admin_user),
) -> WorldPredictionOut:
    """Create a new world prediction. Admin only."""
    prediction = WorldPrediction(
        id=str(uuid.uuid4()),
        topic=body.topic,
        prediction_text=body.prediction_text,
        target_date=body.target_date,
        status=body.status,
        created_at=datetime.utcnow(),
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    return WorldPredictionOut.model_validate(prediction)


@router.patch("/admin/predictions/{prediction_id}", response_model=WorldPredictionOut)
def update_prediction_status(
    prediction_id: str,
    body: UpdatePredictionRequest,
    db: Session = Depends(get_db),
    _admin_id: str = Depends(get_admin_user),
) -> WorldPredictionOut:
    """Update the status of a world prediction. Admin only."""
    prediction = db.query(WorldPrediction).filter(WorldPrediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")

    prediction.status = body.status
    db.commit()
    db.refresh(prediction)
    return WorldPredictionOut.model_validate(prediction)
