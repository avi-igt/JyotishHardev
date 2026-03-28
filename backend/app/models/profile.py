from datetime import datetime, date, time
from enum import Enum
from sqlalchemy import Column, String, Date, Time, DateTime, Integer, Boolean
from sqlalchemy.orm import relationship
from .base import Base


class Tradition(str, Enum):
    parashara = "parashara"
    jaimini = "jaimini"


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True)  # Supabase auth user id
    name = Column(String, nullable=False)
    dob = Column(Date, nullable=False)
    tob = Column(Time, nullable=True)  # None = unknown, defaults to noon chart
    tob_unknown = Column(Boolean, default=False)
    pob = Column(String, nullable=False)  # city name
    pob_lat = Column(String, nullable=False)
    pob_lon = Column(String, nullable=False)
    pob_timezone = Column(String, nullable=False)
    tradition = Column(String, nullable=False, default=Tradition.parashara)
    lagna = Column(String, nullable=True)
    moon_sign = Column(String, nullable=True)
    dpdpa_consent = Column(Boolean, nullable=False, default=False)
    trial_expires_at = Column(DateTime, nullable=False)
    subscription_active = Column(Boolean, default=False)
    subscription_provider = Column(String, nullable=True)  # razorpay | stripe
    subscription_id = Column(String, nullable=True)
    share_token = Column(String, nullable=True, unique=True)  # for /share/:id page
    schema_version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    kundali = relationship("Kundali", back_populates="profile", uselist=False)
    predictions = relationship("Prediction", back_populates="profile")
    events = relationship("Event", back_populates="profile")
    session_memories = relationship("SessionMemory", back_populates="profile")
