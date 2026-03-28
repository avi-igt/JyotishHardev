"""Events route: log life events + atomic AccuracyCorpus increment."""
import uuid
from datetime import datetime, date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.auth import get_current_user
from app.core.db import get_db
from app.models.accuracy_corpus import AccuracyCorpus
from app.models.event import Event
from app.models.prediction import Prediction
from app.models.profile import Profile

router = APIRouter(tags=["events"])


EVENT_TYPES = {"career", "marriage", "health", "finance", "family", "other"}


# ─── Schemas ────────────────────────────────────────────────────────────────────


class EventCreateRequest(BaseModel):
    type: str
    event_date: date
    description: str
    confirms_prediction_id: Optional[str] = None


class EventOut(BaseModel):
    id: str
    profile_id: str
    type: str
    event_date: date
    description: str
    confirms_prediction_id: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Routes ─────────────────────────────────────────────────────────────────────


@router.post("/events", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def log_event(
    body: EventCreateRequest,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> EventOut:
    """Log a life event for the authenticated user.

    If confirms_prediction_id is provided:
    - Validates the prediction belongs to this user.
    - Atomically increments AccuracyCorpus.confirmed_count (SQL UPDATE, no
      read-modify-write to prevent double-counting on concurrent confirms).
    """
    if body.type not in EVENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid event type. Must be one of: {', '.join(sorted(EVENT_TYPES))}",
        )

    # Validate profile exists
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    confirmed_prediction = None
    if body.confirms_prediction_id:
        confirmed_prediction = (
            db.query(Prediction)
            .filter(
                Prediction.id == body.confirms_prediction_id,
                Prediction.profile_id == user_id,  # ownership check
            )
            .first()
        )
        if not confirmed_prediction:
            raise HTTPException(
                status_code=404,
                detail="Prediction not found or does not belong to this user.",
            )

    # Create event
    event = Event(
        id=str(uuid.uuid4()),
        profile_id=user_id,
        type=body.type,
        event_date=body.event_date,
        description=body.description,
        confirms_prediction_id=body.confirms_prediction_id,
    )
    db.add(event)

    # Atomic AccuracyCorpus increment — no read-modify-write
    if confirmed_prediction:
        domain = confirmed_prediction.domain
        dasha_period = confirmed_prediction.dasha_period

        # Upsert: INSERT ... ON CONFLICT DO UPDATE with atomic increment
        db.execute(
            text(
                """
                INSERT INTO accuracy_corpus (id, prediction_domain, dasha_period, confirmed_count, total_count, updated_at)
                VALUES (:id, :domain, :dasha, 1, 0, NOW())
                ON CONFLICT (prediction_domain, dasha_period)
                DO UPDATE SET
                    confirmed_count = accuracy_corpus.confirmed_count + 1,
                    updated_at = NOW()
                """
            ),
            {
                "id": str(uuid.uuid4()),
                "domain": domain,
                "dasha": dasha_period,
            },
        )

    db.commit()
    db.refresh(event)
    return event


@router.get("/events", response_model=List[EventOut])
def list_events(
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[EventOut]:
    """Return all life events for the authenticated user, newest first."""
    events = (
        db.query(Event)
        .filter(Event.profile_id == user_id)
        .order_by(Event.event_date.desc())
        .all()
    )
    return events
