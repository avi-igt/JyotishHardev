"""Public transits endpoint — current planetary positions, no auth required."""
from datetime import datetime, timezone

import swisseph as swe
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["public"])

SIGNS = [
    "Mesha", "Vrishabha", "Mithuna", "Karka",
    "Simha", "Kanya", "Tula", "Vrishchika",
    "Dhanu", "Makara", "Kumbha", "Meena",
]

# Mapping of graha name → pyswisseph body constant
_GRAHAS = [
    ("Sun", swe.SUN),
    ("Moon", swe.MOON),
    ("Mars", swe.MARS),
    ("Mercury", swe.MERCURY),
    ("Jupiter", swe.JUPITER),
    ("Venus", swe.VENUS),
    ("Saturn", swe.SATURN),
    ("Rahu", swe.MEAN_NODE),   # North Node — Rahu
    ("Ketu", None),             # Ketu = Rahu + 180°, computed separately
]


# ─── Schemas ─────────────────────────────────────────────────────────────────


class PlanetTransit(BaseModel):
    planet: str
    sign: str
    degree: float
    longitude: float
    is_retrograde: bool


class TransitsResponse(BaseModel):
    planets: list[PlanetTransit]
    computed_at: str  # ISO datetime UTC


# ─── Endpoint ────────────────────────────────────────────────────────────────


@router.get("/public/transits/current", response_model=TransitsResponse)
def get_current_transits() -> TransitsResponse:
    """Return current sidereal positions of all 9 grahas (Lahiri ayanamsha).

    No auth required. Computed fresh on each request.
    Retrograde: detected from negative speed for planets; Rahu/Ketu always retrograde by convention.
    """
    now_utc = datetime.now(timezone.utc)
    jd = swe.julday(
        now_utc.year,
        now_utc.month,
        now_utc.day,
        now_utc.hour + now_utc.minute / 60.0 + now_utc.second / 3600.0,
    )

    swe.set_sid_mode(swe.SIDM_LAHIRI)
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED

    planets: list[PlanetTransit] = []

    rahu_longitude: float = 0.0

    for name, body_id in _GRAHAS:
        if name == "Ketu":
            # Ketu is exactly opposite Rahu
            longitude = (rahu_longitude + 180.0) % 360.0
            sign_idx = int(longitude / 30) % 12
            degree = longitude % 30
            planets.append(PlanetTransit(
                planet="Ketu",
                sign=SIGNS[sign_idx],
                degree=round(degree, 4),
                longitude=round(longitude, 4),
                is_retrograde=True,  # always retrograde by convention
            ))
            continue

        result, _ = swe.calc_ut(jd, body_id, flags)
        # result[0] = longitude, result[3] = speed in longitude (deg/day)
        longitude = result[0]
        speed = result[3]

        sign_idx = int(longitude / 30) % 12
        degree = longitude % 30

        if name == "Rahu":
            rahu_longitude = longitude
            is_retrograde = True  # always retrograde by convention
        else:
            is_retrograde = speed < 0

        planets.append(PlanetTransit(
            planet=name,
            sign=SIGNS[sign_idx],
            degree=round(degree, 4),
            longitude=round(longitude, 4),
            is_retrograde=is_retrograde,
        ))

    return TransitsResponse(
        planets=planets,
        computed_at=now_utc.strftime("%Y-%m-%dT%H:%M:%SZ"),
    )
