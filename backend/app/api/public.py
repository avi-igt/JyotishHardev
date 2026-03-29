"""Public endpoints — no auth required, no data saved.

Used by the /kundli free chart generator page.
The /kundli/interpret endpoint requires auth (trial or paid users only).
"""
from datetime import date, time as dt_time, datetime
from typing import Optional

import anthropic
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.config import settings
from app.core.db import get_db
from app.models.profile import Profile
from app.services.chart import compute_chart, compute_vimshottari_dasha
from app.services.classifier import classify, ClassifierError, FALLBACK_MESSAGE

router = APIRouter(tags=["public"])

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
]


# ─── Schemas ─────────────────────────────────────────────────────────────────


class PublicKundliRequest(BaseModel):
    name: str
    dob: date
    tob: Optional[dt_time] = None
    tob_unknown: bool = False
    pob: str
    pob_lat: float
    pob_lon: float
    pob_timezone_offset: float


class PlanetPosition(BaseModel):
    sign: str
    degree: float


class PublicKundliResponse(BaseModel):
    name: str
    lagna: str
    moon_sign: str
    nakshatra: str
    current_dasha: str
    tob_unknown: bool
    positions: dict[str, PlanetPosition]


class InterpretRequest(BaseModel):
    name: str
    lagna: str
    moon_sign: str
    nakshatra: str
    current_dasha: str
    tob_unknown: bool
    positions: dict[str, PlanetPosition]


class InterpretResponse(BaseModel):
    personality: str
    career: str
    finances: str
    family: str
    health: str


# ─── Endpoints ───────────────────────────────────────────────────────────────


@router.post("/public/kundli", response_model=PublicKundliResponse)
def compute_public_kundli(body: PublicKundliRequest) -> PublicKundliResponse:
    """Compute a Kundli chart without saving data or requiring auth."""
    tob = body.tob if not body.tob_unknown else None

    try:
        chart = compute_chart(
            dob=body.dob,
            tob=tob,
            lat=body.pob_lat,
            lon=body.pob_lon,
            timezone_offset=body.pob_timezone_offset,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Chart computation failed: {exc}",
        )

    moon_lon = chart["positions"]["Moon"]["longitude"]
    nakshatra_idx = int(moon_lon / (360 / 27)) % 27
    nakshatra = NAKSHATRAS[nakshatra_idx]

    dasha_timeline = compute_vimshottari_dasha(chart, body.dob)
    today = datetime.utcnow()
    current_dasha = "Unknown"
    for period in dasha_timeline:
        start = datetime.fromisoformat(period["start"])
        end = datetime.fromisoformat(period["end"])
        if start <= today <= end:
            current_dasha = f"{period['lord']} Mahadasha"
            break

    positions = {
        name: PlanetPosition(sign=data["sign"], degree=data["degree"])
        for name, data in chart["positions"].items()
    }

    return PublicKundliResponse(
        name=body.name,
        lagna=chart["lagna"],
        moon_sign=chart["moon_sign"],
        nakshatra=nakshatra,
        current_dasha=current_dasha,
        tob_unknown=chart["tob_unknown"],
        positions=positions,
    )


@router.post("/kundli/interpret", response_model=InterpretResponse)
def interpret_kundli(
    body: InterpretRequest,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InterpretResponse:
    """AI-powered Kundli interpretation — trial and paid users only.

    Calls Claude to generate personalised sections for personality,
    career, finances, family, and health. Response passes through
    the classifier to ensure safe framing.
    """
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    now = datetime.utcnow()
    trial_active = now < profile.trial_expires_at
    if not trial_active and not profile.subscription_active:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Upgrade required to access AI interpretations.",
        )

    # Build chart summary for the prompt
    positions_text = "\n".join(
        f"  {planet}: {pos.sign} {pos.degree:.2f}°"
        for planet, pos in body.positions.items()
    )
    tob_note = " (birth time unknown — noon chart, lagna may be inaccurate)" if body.tob_unknown else ""

    prompt = f"""You are Hardev, a learned Vedic astrologer. Based on the following birth chart, write a personalised reading for {body.name}.

Chart details:
- Lagna (Ascendant): {body.lagna}{tob_note}
- Rashi (Moon Sign): {body.moon_sign}
- Nakshatra: {body.nakshatra}
- Current Dasha: {body.current_dasha}

Planetary positions (sidereal, Lahiri ayanamsha):
{positions_text}

Write exactly 5 sections. Each section must start with its label on its own line, followed by 3-4 sentences of personalised interpretation. Be specific to this chart — mention the actual signs and planets, not generic statements.

PERSONALITY:
[3-4 sentences about personality and nature based on lagna, moon sign, and nakshatra]

CAREER:
[3-4 sentences about career strengths and suitable fields based on lagna lord and 10th house]

FINANCES:
[3-4 sentences about financial patterns and wealth indicators based on 2nd and 11th house]

FAMILY:
[3-4 sentences about family life, relationships, and domestic happiness based on 4th and 7th house]

HEALTH:
[3-4 sentences about health tendencies and areas to watch based on lagna and 6th house]

Tone: warm, learned, specific. Like a trusted family astrologer. Never use death language or extreme negative predictions."""

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    try:
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1200,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not reach the astrologer right now. Please try again.",
        )

    # Mandatory classifier
    try:
        classified = classify(raw)
    except ClassifierError:
        classified = FALLBACK_MESSAGE

    # Parse sections from the response
    sections = {"personality": "", "career": "", "finances": "", "family": "", "health": ""}
    current_key = None
    current_lines: list[str] = []

    for line in classified.split("\n"):
        upper = line.strip().upper().rstrip(":")
        if upper in ("PERSONALITY", "CAREER", "FINANCES", "FAMILY", "HEALTH"):
            if current_key and current_lines:
                sections[current_key] = " ".join(current_lines).strip()
            current_key = upper.lower()
            current_lines = []
        elif current_key and line.strip():
            current_lines.append(line.strip())

    if current_key and current_lines:
        sections[current_key] = " ".join(current_lines).strip()

    # Fallback: if parsing failed, put entire response in personality
    if not any(sections.values()):
        sections["personality"] = classified

    return InterpretResponse(**sections)
