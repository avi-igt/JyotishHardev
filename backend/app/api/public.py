"""Public endpoints — no auth required, no data saved.

Used by the /kundli free chart generator page.
"""
from datetime import date, time as dt_time, datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.services.chart import compute_chart, compute_vimshottari_dasha

router = APIRouter(tags=["public"])

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
]


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


@router.post("/public/kundli", response_model=PublicKundliResponse)
def compute_public_kundli(body: PublicKundliRequest) -> PublicKundliResponse:
    """Compute a Kundli chart without saving data or requiring auth.

    Used by the free /kundli page. Returns lagna, rashi, nakshatra,
    current dasha, and planet positions. Never persists anything.
    """
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

    # Current Dasha period
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
