"""Predictions routes: milestone timeline + public share page."""
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.db import get_db
from app.models.prediction import Prediction
from app.models.profile import Profile

router = APIRouter(tags=["predictions"])


# ─── Response schemas ───────────────────────────────────────────────────────────


class PredictionOut(BaseModel):
    id: str
    profile_id: str
    dasha_period: str
    domain: str
    predicted_year_start: int
    predicted_year_end: int
    text: str
    confidence_score: float
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class ShareResponse(BaseModel):
    first_name: str
    predictions: List[PredictionOut]
    disclaimer: str = (
        "This is based on Vedic planetary positions — not a guarantee."
    )


# ─── Routes ─────────────────────────────────────────────────────────────────────


@router.get("/predictions", response_model=List[PredictionOut])
def list_predictions(
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[PredictionOut]:
    """Return the milestone timeline for the authenticated user.

    Returns predictions ordered by year (ascending), filtering out past periods
    more than 2 years ago.
    """
    current_year = datetime.utcnow().year
    predictions = (
        db.query(Prediction)
        .filter(
            Prediction.profile_id == user_id,
            Prediction.predicted_year_end >= current_year - 2,
        )
        .order_by(
            Prediction.predicted_year_start.asc(),
            Prediction.confidence_score.desc(),
        )
        .all()
    )
    return predictions


@router.get("/share/{share_id}", response_model=ShareResponse)
def get_share_page(
    share_id: str,
    db: Session = Depends(get_db),
) -> ShareResponse:
    """Public endpoint — no auth required. Returns first name + predictions.

    Used by the Next.js share page (/share/:id).
    Privacy: first name only — no birth date, time, or location exposed.
    """
    profile = (
        db.query(Profile)
        .filter(Profile.share_token == share_id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This timeline has been removed or the link is invalid.",
        )

    # First name only — never expose full name
    first_name = profile.name.split()[0] if profile.name else "Someone"

    current_year = datetime.utcnow().year
    predictions = (
        db.query(Prediction)
        .filter(
            Prediction.profile_id == profile.id,
            Prediction.predicted_year_end >= current_year - 2,
        )
        .order_by(
            Prediction.predicted_year_start.asc(),
            Prediction.confidence_score.desc(),
        )
        .limit(8)  # Cap at 8 for share page — enough to intrigue, not overwhelm
        .all()
    )

    return ShareResponse(first_name=first_name, predictions=predictions)


@router.post("/predictions/generate", status_code=status.HTTP_202_ACCEPTED)
def trigger_generation(
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Internal endpoint: (re)trigger prediction generation for the current user.

    Useful if the initial background task failed at onboarding.
    """
    from app.services.predictions import generate_predictions_for_profile

    background_tasks.add_task(generate_predictions_for_profile, db, user_id)
    return {"status": "queued"}
