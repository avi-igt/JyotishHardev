"""Prediction generation service.

Generates milestone predictions via LLM (Claude) based on pre-computed Dasha
timeline. The LLM interprets planetary periods — it does NOT generate positions.
All output passes through the classifier before storage.
"""
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.config import settings
from app.models.kundali import GenerationStatus, Kundali
from app.models.prediction import Prediction
from app.models.profile import Profile
from app.services.classifier import classify, ClassifierError, FALLBACK_MESSAGE


DOMAIN_KEYWORDS = {
    "career": "career, professional life, work, ambition, public reputation",
    "health": "health, vitality, physical wellbeing, energy",
    "love": "relationships, romance, marriage, partnerships",
    "finance": "finances, wealth, material prosperity, investments",
    "family": "family, home, children, domestic life",
}


SYSTEM_PROMPT = """You are Hardev, a precise and learned Vedic astrologer.
You interpret pre-computed Dasha timelines to generate milestone predictions.
You do NOT compute planetary positions — those are provided to you.
Generate predictions in plain English, warm and specific, without death language.
Each prediction should be 1-2 sentences, user-facing, actionable.
"""


def generate_predictions_for_profile(db: Session, profile_id: str) -> None:
    """Generate predictions for all Dasha periods in the user's timeline.

    Called as a background task after onboarding. Updates generation_status
    on the Kundali record. Uses 5-year checkpoint to allow resumption on restart.
    """
    import anthropic

    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        return

    kundali = db.query(Kundali).filter(Kundali.profile_id == profile_id).first()
    if not kundali or not kundali.dasha_timeline_json:
        return

    # Mark in progress
    kundali.generation_status = GenerationStatus.in_progress
    db.commit()

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    current_year = datetime.utcnow().year
    birth_year = profile.dob.year

    timeline = kundali.dasha_timeline_json
    checkpoint_year = kundali.generation_checkpoint_year or birth_year

    try:
        for period in timeline:
            period_start_year = int(period["start"][:4])
            period_end_year = int(period["end"][:4])

            # Skip completed checkpoints
            if period_end_year <= checkpoint_year:
                continue

            # Only generate for years within user's plausible lifetime
            if period_start_year > birth_year + 100:
                break

            lord = period["lord"]

            for domain, keywords in DOMAIN_KEYWORDS.items():
                confidence = _compute_confidence(lord, domain, period)

                prompt = (
                    f"Birth chart summary: Lagna={profile.lagna}, "
                    f"Moon sign={profile.moon_sign}, Tradition={profile.tradition}.\n"
                    f"Current Dasha period: {lord} Mahadasha "
                    f"({period['start'][:10]} to {period['end'][:10]}).\n"
                    f"Domain: {domain} ({keywords}).\n"
                    f"Write a 1-2 sentence milestone prediction for this domain during "
                    f"this Dasha period. Be specific and warm. No death language."
                )

                try:
                    message = client.messages.create(
                        model="claude-3-5-haiku-20241022",
                        max_tokens=200,
                        system=SYSTEM_PROMPT,
                        messages=[{"role": "user", "content": prompt}],
                    )
                    raw_text = message.content[0].text

                    # MANDATORY: classify before storing
                    try:
                        classified_text = classify(raw_text)
                    except ClassifierError:
                        classified_text = FALLBACK_MESSAGE

                    prediction = Prediction(
                        id=str(uuid.uuid4()),
                        profile_id=profile_id,
                        dasha_period=f"{lord} Mahadasha",
                        domain=domain,
                        predicted_year_start=max(period_start_year, current_year),
                        predicted_year_end=period_end_year,
                        text=classified_text,
                        raw_text=raw_text,
                        confidence_score=confidence,
                    )
                    db.add(prediction)

                except Exception:
                    # Single prediction failure should not abort the whole batch
                    pass

            # Checkpoint per Dasha period
            kundali.generation_checkpoint_year = period_end_year
            db.commit()

        kundali.generation_status = GenerationStatus.complete
        db.commit()

    except Exception:
        kundali.generation_status = GenerationStatus.failed
        db.commit()
        raise


def _compute_confidence(lord: str, domain: str, period: dict) -> float:
    """Heuristic confidence based on traditional Dasha lord strength per domain.

    This is a simple mapping — a full jyotish engine would compute shadbala etc.
    Returns a float 0.0–1.0.
    """
    # Domain affinity table (lord → domains it naturally rules)
    affinity = {
        "Sun":     {"career": 0.85, "health": 0.70, "love": 0.45, "finance": 0.55, "family": 0.40},
        "Moon":    {"career": 0.50, "health": 0.75, "love": 0.80, "finance": 0.55, "family": 0.85},
        "Mars":    {"career": 0.80, "health": 0.65, "love": 0.55, "finance": 0.60, "family": 0.45},
        "Mercury": {"career": 0.75, "health": 0.60, "love": 0.60, "finance": 0.80, "family": 0.55},
        "Jupiter": {"career": 0.70, "health": 0.75, "love": 0.70, "finance": 0.80, "family": 0.90},
        "Venus":   {"career": 0.55, "health": 0.65, "love": 0.90, "finance": 0.75, "family": 0.70},
        "Saturn":  {"career": 0.75, "health": 0.60, "love": 0.45, "finance": 0.65, "family": 0.50},
        "Rahu":    {"career": 0.70, "health": 0.55, "love": 0.60, "finance": 0.70, "family": 0.45},
        "Ketu":    {"career": 0.45, "health": 0.65, "love": 0.40, "finance": 0.40, "family": 0.50},
    }
    return affinity.get(lord, {}).get(domain, 0.5)
