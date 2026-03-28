"""Onboarding routes: create profile + kundali, trigger prediction generation."""
import uuid
import secrets
from datetime import datetime, timedelta, date, time as dt_time
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.config import settings
from app.core.db import get_db
from app.models.kundali import GenerationStatus, Kundali
from app.models.profile import Profile, Tradition
from app.services.chart import compute_chart, compute_vimshottari_dasha

router = APIRouter(tags=["onboarding"])


# ─── Request / Response schemas ────────────────────────────────────────────────


class OnboardingRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    dob: date
    tob: Optional[dt_time] = None       # None → tob_unknown=True, noon chart
    tob_unknown: bool = False
    pob: str = Field(..., min_length=1)
    pob_lat: float
    pob_lon: float
    pob_timezone: str                   # IANA tz name, e.g. "Asia/Kolkata"
    pob_timezone_offset: float          # hours east of UTC, e.g. 5.5
    tradition: Tradition = Tradition.parashara
    dpdpa_consent: bool = Field(..., description="Must be True to proceed")


class ProfileResponse(BaseModel):
    id: str
    name: str
    dob: date
    tob: Optional[dt_time]
    tob_unknown: bool
    pob: str
    pob_lat: str
    pob_lon: str
    pob_timezone: str
    tradition: str
    lagna: Optional[str]
    moon_sign: Optional[str]
    trial_expires_at: datetime
    subscription_active: bool
    share_token: Optional[str]
    schema_version: int
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class KundaliResponse(BaseModel):
    id: str
    profile_id: str
    chart_json: Optional[dict]
    dasha_timeline_json: Optional[list]
    generation_status: str
    schema_version: int
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class OnboardingResponse(BaseModel):
    profile: ProfileResponse
    kundali: KundaliResponse


class MeResponse(BaseModel):
    profile: ProfileResponse
    kundali: Optional[KundaliResponse]


# ─── Background: prediction generation ─────────────────────────────────────────


def _generate_predictions_background(profile_id: str, db: Session) -> None:
    """Async background task: generate predictions via LLM for all Dasha periods.

    Called after onboarding. Updates generation_status on completion.
    Non-blocking — the profile/kundali endpoint returns before this finishes.
    """
    from app.services.predictions import generate_predictions_for_profile

    try:
        generate_predictions_for_profile(db, profile_id)
    except Exception:
        # Log but do not crash — generation status will remain "failed"
        db.rollback()
        kundali = db.query(Kundali).filter(Kundali.profile_id == profile_id).first()
        if kundali:
            kundali.generation_status = GenerationStatus.failed
            db.commit()


# ─── Routes ────────────────────────────────────────────────────────────────────


@router.post(
    "/profiles",
    response_model=OnboardingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_profile(
    body: OnboardingRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OnboardingResponse:
    """Create the user's Profile and Kundali from birth details.

    - Computes chart synchronously via pyswisseph (never LLM).
    - Creates Kundali record with chart_json + dasha_timeline_json.
    - Queues prediction generation as a background task (non-blocking).
    - Sets trial_expires_at = now + 30 days.
    """
    if not body.dpdpa_consent:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="DPDPA consent is required to create a profile.",
        )

    # Idempotency: if profile already exists, return it
    existing = db.query(Profile).filter(Profile.id == user_id).first()
    if existing:
        kundali = db.query(Kundali).filter(Kundali.profile_id == user_id).first()
        return OnboardingResponse(profile=existing, kundali=kundali)

    # Compute chart (math — NOT LLM)
    tob = body.tob if not body.tob_unknown else None
    try:
        chart = compute_chart(
            dob=body.dob,
            tob=tob,
            lat=float(body.pob_lat),
            lon=float(body.pob_lon),
            timezone_offset=body.pob_timezone_offset,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Chart computation failed: {exc}",
        )

    dasha_timeline = compute_vimshottari_dasha(chart, body.dob)

    # Create Profile
    share_token = secrets.token_urlsafe(16)
    profile = Profile(
        id=user_id,
        name=body.name,
        dob=body.dob,
        tob=tob,
        tob_unknown=body.tob_unknown or (tob is None),
        pob=body.pob,
        pob_lat=str(body.pob_lat),
        pob_lon=str(body.pob_lon),
        pob_timezone=body.pob_timezone,
        tradition=body.tradition,
        lagna=chart["lagna"],
        moon_sign=chart["moon_sign"],
        dpdpa_consent=body.dpdpa_consent,
        trial_expires_at=datetime.utcnow() + timedelta(days=settings.trial_days),
        share_token=share_token,
        schema_version=1,
    )
    db.add(profile)

    # Create Kundali
    kundali = Kundali(
        id=str(uuid.uuid4()),
        profile_id=user_id,
        chart_json=chart,
        dasha_timeline_json=dasha_timeline,
        generation_status=GenerationStatus.pending,
        schema_version=1,
    )
    db.add(kundali)
    db.commit()
    db.refresh(profile)
    db.refresh(kundali)

    # Queue prediction generation (non-blocking)
    background_tasks.add_task(_generate_predictions_background, user_id, db)

    return OnboardingResponse(profile=profile, kundali=kundali)


@router.get("/profiles/me", response_model=MeResponse)
def get_my_profile(
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MeResponse:
    """Return the authenticated user's profile + kundali + generation_status."""
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please complete onboarding.",
        )

    kundali = db.query(Kundali).filter(Kundali.profile_id == user_id).first()
    return MeResponse(profile=profile, kundali=kundali)
