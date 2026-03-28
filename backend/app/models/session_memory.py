from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from .base import Base


class SessionMemory(Base):
    __tablename__ = "session_memories"

    id = Column(String, primary_key=True)
    profile_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    session_date = Column(DateTime, nullable=False)
    summary_text = Column(String, nullable=False)
    predictions_made = Column(JSON, default=list)   # list of prediction ids referenced
    events_logged = Column(JSON, default=list)       # list of event ids logged this session
    embedding = Column(Vector(1536), nullable=True)  # embedded at session end
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", back_populates="session_memories")
