from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from .base import Base


class FamilyLink(Base):
    """Phase 2: links family members' profiles.

    Invitation-only — each linked member independently consents via OTP.
    DPDPA 2023 compliance required.
    """
    __tablename__ = "family_links"

    id = Column(String, primary_key=True)
    primary_profile_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    linked_profile_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    relationship = Column(String, nullable=False)   # spouse | child | parent | sibling
    invited_at = Column(DateTime, default=datetime.utcnow)
    accepted_at = Column(DateTime, nullable=True)
