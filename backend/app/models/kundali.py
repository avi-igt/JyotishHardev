from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, Integer, JSON, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class GenerationStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    complete = "complete"
    failed = "failed"


class Kundali(Base):
    __tablename__ = "kundalis"

    id = Column(String, primary_key=True)
    profile_id = Column(String, ForeignKey("profiles.id"), nullable=False, unique=True)
    chart_json = Column(JSON, nullable=True)       # planetary positions
    dasha_timeline_json = Column(JSON, nullable=True)  # full Dasha/Antardasha timeline
    generation_status = Column(String, default=GenerationStatus.pending)
    generation_checkpoint_year = Column(Integer, nullable=True)  # last completed 5-yr chunk
    schema_version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", back_populates="kundali")
