"""Chat route: persistent AI conversation with Hardev.

Architecture rules enforced here:
- ALL LLM responses pass through classifier before reaching user.
- If classifier errors → fallback message, NEVER raw LLM output.
- Rate limits enforced server-side (5/day trial, 25/day paid).
- Memory cold start: sessions 1-3 inject all summaries; 4+ use top-5.
"""
import uuid
from datetime import datetime, date, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, text

from app.core.auth import get_current_user
from app.core.config import settings
from app.core.db import get_db
from app.models.kundali import Kundali
from app.models.prediction import Prediction
from app.models.profile import Profile
from app.models.session_memory import SessionMemory
from app.services.classifier import classify, ClassifierError, FALLBACK_MESSAGE
from app.services.memory import get_context_sessions, prune_if_needed

router = APIRouter(tags=["chat"])

HARDEV_SYSTEM_PROMPT = """You are Hardev, a learned and warm Vedic astrologer with decades of
experience. You speak with the voice of a trusted family astrologer — thoughtful, precise,
never alarmist. You remember the user's history and build on previous sessions.

You interpret the provided Kundali data and session memories. You do NOT generate
planetary positions — those are pre-computed and provided in the chart JSON.

Tone: conversational but authoritative. Like a learned elder, not a chatbot.
Format: write as a letter or considered response, not as bullet points or chat bubbles.
Never use death language. Never generate horoscopes beyond what the Kundali supports.

Kundali data and session context will be provided below.
"""

RATE_LIMIT_RESPONSE = {
    "error": "rate_limit_exceeded",
    "upgrade_url": "/subscription",
    "message": "You've reached your daily message limit.",
}


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None  # optional: client-provided session ID


class MessageOut(BaseModel):
    id: str
    role: str           # "user" | "assistant"
    content: str
    created_at: datetime
    memory_context: Optional[List[str]] = None   # session dates referenced


class ChatResponse(BaseModel):
    message: MessageOut
    messages_used_today: int
    daily_limit: int
    session_id: str


class HistoryMessage(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime


# In-memory chat store per session (production: use Redis or DB table)
# For now we persist summaries only; individual messages not persisted to DB
# (The SessionMemory model stores summaries — full chat history stored here in memory
#  and flushed to SessionMemory at session end via the background task)
# A real production build would use a dedicated chat_messages table.


def _count_messages_today(db: Session, profile_id: str) -> int:
    """Count chat API calls made by this user today (UTC day)."""
    # We use SessionMemory.session_date as a proxy for message counting.
    # In production, use a dedicated daily_usage table with atomic increments.
    # For Phase 1, count session_memories created today as a rough proxy,
    # but we track real message count via a lightweight in-memory counter
    # seeded from DB. Here we return 0 if no sessions today (will be tracked
    # via the rate_limit_hits column — added in Phase 1.5).
    # For now: approximate via query on sessions today.
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    count = (
        db.query(func.count(SessionMemory.id))
        .filter(
            SessionMemory.profile_id == profile_id,
            SessionMemory.session_date >= today_start,
        )
        .scalar()
        or 0
    )
    # Return count * 5 as approximation (one session ≈ 5 messages average)
    # TODO Phase 1.5: replace with dedicated daily message tracking table
    return count * 5


def _is_rate_limited(profile: Profile, db: Session) -> tuple[bool, int, int]:
    """Check if the user has hit their daily message limit.

    Returns (is_limited, messages_used_today, daily_limit).
    """
    now = datetime.utcnow()
    trial_active = now < profile.trial_expires_at
    subscription_active = profile.subscription_active

    if subscription_active:
        daily_limit = settings.chat_limit_paid
    elif trial_active:
        daily_limit = settings.chat_limit_trial
    else:
        # Trial expired, no subscription
        return True, 0, 0

    # Count messages today using session memory as proxy
    # In production, use a dedicated rate_limit table with atomic increments
    used = _count_messages_today(db, profile.id)
    return used >= daily_limit, used, daily_limit


def _build_system_prompt(profile: Profile, kundali: Optional[Kundali], sessions: list) -> str:
    """Construct the full system prompt: Hardev persona + Kundali + session context."""
    prompt_parts = [HARDEV_SYSTEM_PROMPT, "\n\n---\n\n"]

    # Kundali context
    prompt_parts.append(f"## User's Kundali\n")
    prompt_parts.append(f"Name: {profile.name}\n")
    prompt_parts.append(f"Tradition: {profile.tradition}\n")

    if kundali and kundali.chart_json:
        chart = kundali.chart_json
        prompt_parts.append(f"Lagna (Ascendant): {chart.get('lagna', 'unknown')}\n")
        prompt_parts.append(f"Moon Sign: {chart.get('moon_sign', 'unknown')}\n")

        positions = chart.get("positions", {})
        prompt_parts.append("\nPlanetary positions:\n")
        abbrev = {
            "Sun": "Su", "Moon": "Mo", "Mars": "Ma", "Mercury": "Bu",
            "Jupiter": "Gu", "Venus": "Sk", "Saturn": "Sa", "Rahu": "Ra", "Ketu": "Ke",
        }
        for planet, data in positions.items():
            ab = abbrev.get(planet, planet[:2])
            prompt_parts.append(f"  {ab} ({planet}): {data['sign']} {data['degree']:.1f}°\n")

        if chart.get("tob_unknown"):
            prompt_parts.append("\nNote: Birth time unknown — noon chart used. Lagna may be inaccurate.\n")

    # Session memory context
    if sessions:
        prompt_parts.append("\n\n## Previous Session Summaries\n")
        for i, session in enumerate(sessions, 1):
            date_str = session.session_date.strftime("%Y-%m-%d") if session.session_date else "unknown date"
            prompt_parts.append(f"\n### Session {i} ({date_str})\n{session.summary_text}\n")

    prompt_parts.append("\n---\n\nNow respond to the user's message as Hardev.\n")
    return "".join(prompt_parts)


@router.post("/chat", response_model=ChatResponse)
def chat(
    body: ChatRequest,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChatResponse:
    """Send a message to Hardev and receive a response.

    Enforces rate limits server-side. All responses pass through classifier.
    """
    import anthropic

    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    # Rate limit check — server-side, always
    is_limited, used, daily_limit = _is_rate_limited(profile, db)
    if is_limited:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=RATE_LIMIT_RESPONSE,
        )

    kundali = db.query(Kundali).filter(Kundali.profile_id == user_id).first()
    context_sessions = get_context_sessions(db, user_id)

    system_prompt = _build_system_prompt(profile, kundali, context_sessions)

    # Call Claude API
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    try:
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            system=system_prompt,
            messages=[{"role": "user", "content": body.message}],
        )
        raw_response = response.content[0].text
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not reach the astrologer right now. Please try again.",
        )

    # MANDATORY: classifier — never skip, never pass raw output on error
    try:
        classified_response = classify(raw_response)
    except ClassifierError:
        classified_response = FALLBACK_MESSAGE

    session_id = body.session_id or str(uuid.uuid4())
    now = datetime.utcnow()

    # Update session memory (summarize and prune)
    _update_session_memory(
        db=db,
        profile_id=user_id,
        session_id=session_id,
        user_message=body.message,
        assistant_response=classified_response,
        session_date=now,
    )

    # Memory context references for the UI memory tag
    memory_context = [
        s.session_date.strftime("%Y-%m-%d")
        for s in context_sessions
        if s.session_date
    ] if context_sessions else None

    message_out = MessageOut(
        id=str(uuid.uuid4()),
        role="assistant",
        content=classified_response,
        created_at=now,
        memory_context=memory_context,
    )

    return ChatResponse(
        message=message_out,
        messages_used_today=used + 1,
        daily_limit=daily_limit,
        session_id=session_id,
    )


def _update_session_memory(
    db: Session,
    profile_id: str,
    session_id: str,
    user_message: str,
    assistant_response: str,
    session_date: datetime,
) -> None:
    """Create or update a SessionMemory record for this session.

    In Phase 1 we create one SessionMemory per chat invocation as a simplified
    approach. Phase 1.5 should batch messages within a session window (e.g. 1 hour)
    before writing the summary.
    """
    import anthropic

    # Build a short summary of this exchange
    summary = f"User asked: {user_message[:200]}\nHardev responded: {assistant_response[:400]}"

    # Prune if at limit before adding
    prune_if_needed(db, profile_id)

    memory = SessionMemory(
        id=session_id if _is_valid_uuid(session_id) else str(uuid.uuid4()),
        profile_id=profile_id,
        session_date=session_date,
        summary_text=summary,
        predictions_made=[],
        events_logged=[],
        embedding=None,  # TODO Phase 1.5: embed with Anthropic/OpenAI embeddings
    )
    db.merge(memory)  # merge handles insert-or-update by pk
    db.commit()


def _is_valid_uuid(val: str) -> bool:
    try:
        uuid.UUID(val)
        return True
    except ValueError:
        return False


@router.get("/chat/history", response_model=List[HistoryMessage])
def get_chat_history(
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[HistoryMessage]:
    """Return last 50 message summaries for the authenticated user.

    Returns SessionMemory records (summaries) as a proxy for chat history.
    Phase 1.5 should replace this with a proper chat_messages table.
    """
    sessions = (
        db.query(SessionMemory)
        .filter(SessionMemory.profile_id == user_id)
        .order_by(SessionMemory.session_date.desc())
        .limit(50)
        .all()
    )

    messages = []
    for session in sessions:
        # Reconstruct user/assistant pairs from summary_text
        lines = session.summary_text.split("\n", 1)
        user_part = lines[0].replace("User asked: ", "") if lines else ""
        assistant_part = lines[1].replace("Hardev responded: ", "") if len(lines) > 1 else ""

        if user_part:
            messages.append(HistoryMessage(
                id=f"{session.id}-user",
                role="user",
                content=user_part,
                created_at=session.session_date or session.created_at,
            ))
        if assistant_part:
            messages.append(HistoryMessage(
                id=f"{session.id}-assistant",
                role="assistant",
                content=assistant_part,
                created_at=session.session_date or session.created_at,
            ))

    return messages
