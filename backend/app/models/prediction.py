from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True)
    profile_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    dasha_period = Column(String, nullable=False)   # e.g. "Jupiter Mahadasha"
    domain = Column(String, nullable=False)          # career | health | love | finance | family
    predicted_year_start = Column(Integer, nullable=False)
    predicted_year_end = Column(Integer, nullable=False)
    text = Column(String, nullable=False)            # user-facing, already classified
    raw_text = Column(String, nullable=False)        # pre-classifier output (internal)
    confidence_score = Column(Float, nullable=False)  # 0.0–1.0
    created_at = Column(DateTime, default=datetime.utcnow)
    refreshed_at = Column(DateTime, nullable=True)

    profile = relationship("Profile", back_populates="predictions")
    events = relationship("Event", back_populates="confirmed_prediction")
