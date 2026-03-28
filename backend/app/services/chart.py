"""Vedic chart computation using pyswisseph.

Planetary positions are computed mathematically — never by LLM.
"""
from datetime import date, time, datetime
from typing import Optional
import swisseph as swe


PLANETS = {
    "Sun": swe.SUN,
    "Moon": swe.MOON,
    "Mars": swe.MARS,
    "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER,
    "Venus": swe.VENUS,
    "Saturn": swe.SATURN,
    "Rahu": swe.MEAN_NODE,
}

SIGNS = [
    "Mesha", "Vrishabha", "Mithuna", "Karka",
    "Simha", "Kanya", "Tula", "Vrishchika",
    "Dhanu", "Makara", "Kumbha", "Meena",
]

VIMSHOTTARI_SEQUENCE = [
    ("Ketu", 7), ("Venus", 20), ("Sun", 6), ("Moon", 10),
    ("Mars", 7), ("Rahu", 18), ("Jupiter", 16), ("Saturn", 19), ("Mercury", 17),
]


def compute_chart(
    dob: date,
    tob: Optional[time],
    lat: float,
    lon: float,
    timezone_offset: float,
) -> dict:
    """Compute natal chart. If tob is None, defaults to noon (with disclaimer flag)."""
    if tob is None:
        hour = 12.0
        tob_unknown = True
    else:
        hour = tob.hour + tob.minute / 60.0
        tob_unknown = False

    # Convert to Julian Day (UT)
    ut_hour = hour - timezone_offset
    jd = swe.julday(dob.year, dob.month, dob.day, ut_hour)

    positions = {}
    for name, planet_id in PLANETS.items():
        result, _ = swe.calc_ut(jd, planet_id)
        lon_deg = result[0]
        sign_idx = int(lon_deg / 30)
        degree_in_sign = lon_deg % 30
        positions[name] = {
            "longitude": lon_deg,
            "sign": SIGNS[sign_idx],
            "degree": round(degree_in_sign, 4),
        }

    # Ketu is always 180° from Rahu
    rahu_lon = positions["Rahu"]["longitude"]
    ketu_lon = (rahu_lon + 180) % 360
    positions["Ketu"] = {
        "longitude": ketu_lon,
        "sign": SIGNS[int(ketu_lon / 30)],
        "degree": round(ketu_lon % 30, 4),
    }

    # Ascendant (Lagna)
    houses, asc_mc = swe.houses(jd, lat, lon, b"P")
    lagna_lon = asc_mc[0]
    lagna = SIGNS[int(lagna_lon / 30)]

    moon_sign = positions["Moon"]["sign"]

    return {
        "lagna": lagna,
        "lagna_longitude": lagna_lon,
        "moon_sign": moon_sign,
        "positions": positions,
        "tob_unknown": tob_unknown,
        "jd": jd,
    }


def compute_vimshottari_dasha(chart: dict, dob: date) -> list[dict]:
    """Compute Vimshottari Dasha timeline from birth to ~120 years."""
    moon_lon = chart["positions"]["Moon"]["longitude"]

    # Nakshatra lord determines starting Dasha
    nakshatra_idx = int(moon_lon / (360 / 27))
    lord_order = [p for p, _ in VIMSHOTTARI_SEQUENCE]
    start_lord_idx = nakshatra_idx % 9

    # Fraction of first Dasha remaining at birth
    fraction_in_nakshatra = (moon_lon % (360 / 27)) / (360 / 27)
    _, first_years = VIMSHOTTARI_SEQUENCE[start_lord_idx]
    elapsed = fraction_in_nakshatra * first_years
    remaining = first_years - elapsed

    timeline = []
    current_date = datetime(dob.year, dob.month, dob.day)

    for i in range(len(VIMSHOTTARI_SEQUENCE) * 3):  # ~3 full cycles
        idx = (start_lord_idx + i) % len(VIMSHOTTARI_SEQUENCE)
        lord, years = VIMSHOTTARI_SEQUENCE[idx]
        period_years = remaining if i == 0 else years

        end_date = datetime(
            current_date.year + int(period_years),
            current_date.month,
            current_date.day,
        )

        timeline.append({
            "lord": lord,
            "start": current_date.isoformat(),
            "end": end_date.isoformat(),
            "years": round(period_years, 2),
        })

        current_date = end_date
        remaining = years

        if current_date.year > dob.year + 120:
            break

    return timeline
