from datetime import datetime, date
from sqlalchemy import Column, String, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True)
    profile_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    type = Column(String, nullable=False)           # career | marriage | health | finance | family | other
    event_date = Column(Date, nullable=False)
    description = Column(String, nullable=False)
    confirms_prediction_id = Column(String, ForeignKey("predictions.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", back_populates="events")
    confirmed_prediction = relationship("Prediction", back_populates="events")
