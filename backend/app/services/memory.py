"""Session memory service: retrieves relevant past sessions for LLM context.

Cold start rule:
  Sessions 1-3: inject ALL session summaries directly (no vector search).
  Session 4+:   pgvector cosine similarity, top-5 most relevant sessions.

Max 20 sessions stored per user. Session 21 prunes session 1 and updates index.
"""
from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from app.models.session_memory import SessionMemory
from app.core.config import settings


def get_context_sessions(db: Session, profile_id: str) -> list[SessionMemory]:
    """Return sessions to inject into the LLM prompt for this user."""
    all_sessions = (
        db.execute(
            select(SessionMemory)
            .where(SessionMemory.profile_id == profile_id)
            .order_by(SessionMemory.session_date.desc())
        )
        .scalars()
        .all()
    )

    session_count = len(all_sessions)

    if session_count <= settings.session_memory_cold_start:
        # Cold start: inject all sessions
        return list(all_sessions)

    # Session 4+: return top-5 by recency (vector search to be wired up with pgvector query)
    # TODO: replace with pgvector cosine similarity once embeddings are populated
    return list(all_sessions[:5])


def prune_if_needed(db: Session, profile_id: str) -> None:
    """If user has more than max sessions, prune oldest and update index."""
    sessions = (
        db.execute(
            select(SessionMemory)
            .where(SessionMemory.profile_id == profile_id)
            .order_by(SessionMemory.session_date.asc())
        )
        .scalars()
        .all()
    )

    if len(sessions) >= settings.session_memory_max:
        oldest = sessions[0]
        db.execute(
            delete(SessionMemory).where(SessionMemory.id == oldest.id)
        )
        db.commit()
