from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer
from .base import Base


class AccuracyCorpus(Base):
    """Anonymized aggregate of confirmed predictions by domain + dasha period.

    Never stores individual user data. confirmed_count incremented atomically
    when a user confirms a prediction (Event.confirms_prediction_id set).
    total_count and disconfirm flow deferred to Phase 1.5.
    """
    __tablename__ = "accuracy_corpus"

    id = Column(String, primary_key=True)
    prediction_domain = Column(String, nullable=False)   # career | health | love | finance | family
    dasha_period = Column(String, nullable=False)        # e.g. "Jupiter Mahadasha"
    confirmed_count = Column(Integer, default=0, nullable=False)
    total_count = Column(Integer, default=0, nullable=False)  # Phase 1.5
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
