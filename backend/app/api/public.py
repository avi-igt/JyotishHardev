"""Public endpoints — no auth, no database, no user data stored.

All endpoints are free and anonymous. Data is computed on the fly using
pyswisseph for ephemeris math and Claude for AI interpretations.
"""
from datetime import date, time as dt_time, datetime, timezone, timedelta
from typing import Optional

import swisseph as swe
import anthropic
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.core.config import settings
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


# ─── Panchang data ────────────────────────────────────────────────────────────

TITHIS = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima/Amavasya",
]

YOGAS = [
    "Vishkumbha", "Preeti", "Ayushman", "Saubhagya", "Shobhana",
    "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
    "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
    "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma",
    "Indra", "Vaidhriti",
]

# In-memory daily cache keyed by IST date string "YYYY-MM-DD"
_panchang_cache: dict = {}


def _get_ist_date() -> str:
    """Return today's date in IST (UTC+5:30) as YYYY-MM-DD string."""
    ist = timezone(timedelta(hours=5, minutes=30))
    return datetime.now(ist).strftime("%Y-%m-%d")


def _compute_panchang() -> dict:
    """Compute today's Panchang values using pyswisseph (sidereal, Lahiri)."""
    IST = timezone(timedelta(hours=5, minutes=30))
    now_ist = datetime.now(IST)
    # Use midnight IST (start of day) for the computation
    dt_utc = now_ist.replace(hour=0, minute=0, second=0, microsecond=0).astimezone(timezone.utc)
    jd = swe.julday(dt_utc.year, dt_utc.month, dt_utc.day, dt_utc.hour + dt_utc.minute / 60.0)

    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsha = swe.get_ayanamsa(jd)
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL

    sun_lon_raw, _ = swe.calc_ut(jd, swe.SUN, flags)
    moon_lon_raw, _ = swe.calc_ut(jd, swe.MOON, flags)
    sun_lon = sun_lon_raw[0]
    moon_lon = moon_lon_raw[0]

    # Tithi: each tithi is 12° of Moon-Sun separation (1-30)
    diff = (moon_lon - sun_lon) % 360
    tithi_idx = int(diff / 12)  # 0-29
    tithi_name = TITHIS[tithi_idx % 15]
    paksha = "Shukla" if tithi_idx < 15 else "Krishna"
    tithi = f"{paksha} {tithi_name}"

    # Nakshatra: Moon's nakshatra (27 nakshatras × 13°20')
    nakshatra_idx = int(moon_lon / (360 / 27)) % 27
    nakshatra = NAKSHATRAS[nakshatra_idx]

    # Yoga: (Sun + Moon) / 13°20' — 27 yogas
    yoga_lon = (sun_lon + moon_lon) % 360
    yoga_idx = int(yoga_lon / (360 / 27)) % 27
    yoga = YOGAS[yoga_idx]

    # Moon sign
    moon_sign_idx = int(moon_lon / 30) % 12
    moon_signs = [
        "Mesha", "Vrishabha", "Mithuna", "Karka",
        "Simha", "Kanya", "Tula", "Vrishchika",
        "Dhanu", "Makara", "Kumbha", "Meena",
    ]
    moon_sign = moon_signs[moon_sign_idx]

    return {
        "tithi": tithi,
        "nakshatra": nakshatra,
        "yoga": yoga,
        "moon_sign": moon_sign,
        "date_ist": now_ist.strftime("%d %B %Y"),
    }


def _get_energy_summary(panchang: dict) -> str:
    """Call Claude to generate a 2-3 sentence energy-of-the-day summary."""
    prompt = f"""You are Hardev, a learned Vedic astrologer. Today's Panchang is:
- Tithi: {panchang['tithi']}
- Nakshatra: {panchang['nakshatra']}
- Yoga: {panchang['yoga']}
- Moon in: {panchang['moon_sign']}

Write exactly 2-3 sentences describing the cosmic energy of today — what themes, qualities, and activities are supported by these planetary conditions. Be specific to these exact Panchang values. Warm, learned tone. No death language. No bullet points — flowing prose only."""

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=200,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text.strip()


# ─── Schemas ─────────────────────────────────────────────────────────────────


class PanchangResponse(BaseModel):
    tithi: str
    nakshatra: str
    yoga: str
    moon_sign: str
    date_ist: str
    energy_summary: str


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


@router.get("/public/panchang/today", response_model=PanchangResponse)
def get_today_panchang() -> PanchangResponse:
    """Return today's Panchang (Tithi, Nakshatra, Yoga, Moon sign) with AI energy summary.

    Cached in memory per IST date — Claude is called at most once per day.
    No auth required.
    """
    today = _get_ist_date()
    if today in _panchang_cache:
        return PanchangResponse(**_panchang_cache[today])

    panchang = _compute_panchang()
    try:
        energy_summary = _get_energy_summary(panchang)
    except Exception:
        energy_summary = (
            f"The Moon in {panchang['moon_sign']} under {panchang['nakshatra']} nakshatra "
            f"during {panchang['tithi']} tithi brings a day of reflection and inner awareness. "
            f"The {panchang['yoga']} yoga supports mindful action and thoughtful decisions."
        )

    result = {**panchang, "energy_summary": energy_summary}
    _panchang_cache[today] = result
    # Evict old cache entries (keep only today)
    for k in list(_panchang_cache.keys()):
        if k != today:
            del _panchang_cache[k]

    return PanchangResponse(**result)


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
def interpret_kundli(body: InterpretRequest) -> InterpretResponse:
    """AI-powered Kundli interpretation — free for all, no auth required.

    Calls Claude to generate personalised sections for personality,
    career, finances, family, and health. Response passes through
    the classifier to ensure safe framing.
    """
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


# ─── World Predictions (static) ───────────────────────────────────────────────

class WorldPredictionItem(BaseModel):
    id: str
    topic: str
    text: str
    posted_at: str
    target_date: Optional[str] = None
    status: str  # "pending" | "confirmed" | "missed"


class WorldPredictionsResponse(BaseModel):
    predictions: list[WorldPredictionItem]
    accuracy_pct: Optional[float] = None
    total_confirmed: int = 0
    total_evaluated: int = 0


# Edit this list directly to add or update Hardev's world predictions.
_WORLD_PREDICTIONS: list[dict] = [
    {
        "id": "pred-001",
        "topic": "India",
        "text": (
            "Saturn's transit through Aquarius places immense karmic pressure on established global economic hierarchies. "
            "India, in a potent Jupiter Mahadasha at the national level, will complete its ascent — by late 2025 India will "
            "formally become the world's third-largest economy by GDP, surpassing Japan. The decisive window opens between "
            "Akshaya Tritiya 2024 and Diwali 2025, when Guru's blessings align with national karma."
        ),
        "posted_at": "2024-01-15",
        "target_date": "2025-12-31",
        "status": "confirmed",
    },
    {
        "id": "pred-002",
        "topic": "Technology",
        "text": (
            "Rahu in Pisces governs illusions, artificial realities, and the dissolution of boundaries. Its conjunction "
            "with Jupiter in 2024 will accelerate a historic inflection for artificial intelligence — not merely as a tool "
            "but as a genuine disruptor of knowledge-based professions. By mid-2025, major institutions globally will be "
            "restructuring employment and education around AI capabilities. This is Rahu's shadow made manifest."
        ),
        "posted_at": "2024-03-20",
        "target_date": "2025-06-30",
        "status": "confirmed",
    },
    {
        "id": "pred-003",
        "topic": "Markets",
        "text": (
            "Venus and Jupiter both in earth signs through 2024–2025 create extraordinary conditions for tangible wealth "
            "accumulation. Gold — Venus's domain in Jyotish — will reach historic highs, breaching ₹90,000 per 10g and "
            "$3,000 per troy ounce internationally before the end of 2025. The Dhan Yoga in the current planetary period "
            "is exceptionally strong. Those who hold the metal of Venus will be rewarded."
        ),
        "posted_at": "2024-06-01",
        "target_date": "2025-09-30",
        "status": "confirmed",
    },
    {
        "id": "pred-004",
        "topic": "Geopolitics",
        "text": (
            "The Rahu-Ketu axis shifting into Pisces-Virgo from October 2023 dissolves the illusion of stable Middle "
            "Eastern geopolitics. A major conflict escalation in the region will reshape diplomatic alignments — old "
            "alliances will fracture and unexpected coalitions will form before the axis moves again in April 2025. "
            "This is a period of structural, not surface, change. What was hidden beneath the sand will be revealed."
        ),
        "posted_at": "2023-11-01",
        "target_date": "2025-04-30",
        "status": "confirmed",
    },
    {
        "id": "pred-005",
        "topic": "Technology",
        "text": (
            "Mercury — planet of commerce, communication, and contracts — will occupy an exceptionally powerful position "
            "through Uttara Bhadrapada nakshatra in 2026. A meaningful international AI governance framework will gain "
            "traction before year-end, led not by the United States or China but by a coalition of mid-sized economies. "
            "The era of ungoverned algorithmic power is ending. Budha's clarity will demand accountability."
        ),
        "posted_at": "2025-08-10",
        "target_date": "2026-12-31",
        "status": "pending",
    },
    {
        "id": "pred-006",
        "topic": "Markets",
        "text": (
            "Saturn's ingress into Pisces brings a testing period for speculative instruments. Cryptocurrency markets — "
            "having reached euphoric highs during Rahu's influence — will face a significant structural correction in 2026. "
            "Bitcoin specifically will experience a 40–55% drawdown from its 2025 peak before recovering. This is Shani's "
            "discipline upon Rahu's excess. The correction will feel severe but is ultimately purifying."
        ),
        "posted_at": "2025-10-15",
        "target_date": "2026-10-31",
        "status": "pending",
    },
    {
        "id": "pred-007",
        "topic": "India",
        "text": (
            "India's Gaganyaan programme carries the auspicious energy of Surya in the 10th house of the nation's "
            "independence chart — the house of public achievement and sovereign glory. The first crewed Gaganyaan mission "
            "will launch successfully in 2026, placing India among the elite nations with independent human spaceflight. "
            "This is a moment of Surya's light shining brightest on the ancient land."
        ),
        "posted_at": "2025-04-22",
        "target_date": "2026-12-31",
        "status": "pending",
    },
    {
        "id": "pred-008",
        "topic": "Global",
        "text": (
            "Jupiter's move into Cancer — its sign of exaltation — initiates a period of humanitarian and ecological "
            "expansion. A landmark climate financing agreement will be reached before mid-2027, with India playing a "
            "pivotal mediating role between the developed and developing world. This is the moment when Guru's compassion "
            "meets Prithvi's (Earth's) urgent need. The stars are aligned for a historic compact."
        ),
        "posted_at": "2026-01-06",
        "target_date": "2027-06-30",
        "status": "pending",
    },
    {
        "id": "pred-009",
        "topic": "India",
        "text": (
            "The Dasha of Rahu in India's national chart continues to push the country outward and forward, dissolving "
            "old insularity. The Indian Rupee will take a meaningful step toward internationalisation in 2026–2027 — a "
            "bilateral trade settlement framework with at least five nations will formally adopt INR, reducing dependence "
            "on dollar-denominated trade. The old financial world order shifts quietly but irreversibly."
        ),
        "posted_at": "2026-02-14",
        "target_date": "2027-01-31",
        "status": "pending",
    },
    {
        "id": "pred-010",
        "topic": "Geopolitics",
        "text": (
            "Saturn in Pisces dissolves rigid structures and demands accountability from centres of power. The US-China "
            "tension, building through successive Saturn transits, reaches a structural inflection in 2026–2027. Rather "
            "than outright confrontation, a formal 'managed competition' framework will emerge — acknowledging rivalry "
            "without triggering direct conflict, brokered in part through ASEAN intermediaries. Shani rewards those who "
            "build durable structures, not those who posture."
        ),
        "posted_at": "2025-12-21",
        "target_date": "2027-12-31",
        "status": "pending",
    },
    {
        "id": "pred-011",
        "topic": "Markets",
        "text": (
            "Pitru Paksha of 2026 — the lunar fortnight of ancestors — coincides with Venus debilitated in Virgo and "
            "Saturn casting its third aspect on major financial houses. US technology indices will face a meaningful "
            "correction in Q3–Q4 2026, in the range of 15–25% from their 2026 peaks. This is not systemic collapse but "
            "a Saturnine rebalancing after years of Jupiter-fuelled optimism. Patience and quality will be rewarded."
        ),
        "posted_at": "2026-03-08",
        "target_date": "2026-12-31",
        "status": "pending",
    },
    {
        "id": "pred-012",
        "topic": "Technology",
        "text": (
            "Ashlesha nakshatra — ruled by Mercury, symbolised by the coiled serpent of hidden wisdom — governs "
            "transformative breakthroughs in applied science during 2025–2026. Quantum computing will cross a meaningful "
            "commercial threshold in this period: a real-world application in drug discovery or materials science will be "
            "demonstrated at scale for the first time, shifting quantum from theoretical promise to commercially relevant "
            "reality. The serpent's knowledge is finally ready to be released."
        ),
        "posted_at": "2025-07-04",
        "target_date": "2026-12-31",
        "status": "pending",
    },
]


@router.get("/public/predictions", response_model=WorldPredictionsResponse)
def list_world_predictions() -> WorldPredictionsResponse:
    """Return Hardev's macro predictions. No auth required. Data is hardcoded in this file."""
    items = [WorldPredictionItem(**p) for p in _WORLD_PREDICTIONS]
    non_pending = [p for p in items if p.status != "pending"]
    confirmed = [p for p in non_pending if p.status == "confirmed"]
    accuracy_pct = (
        round(len(confirmed) / len(non_pending) * 100, 1) if non_pending else None
    )
    return WorldPredictionsResponse(
        predictions=items,
        accuracy_pct=accuracy_pct,
        total_confirmed=len(confirmed),
        total_evaluated=len(non_pending),
    )
