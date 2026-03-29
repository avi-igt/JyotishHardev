"""WorldPrediction model — public astrology predictions with status tracking."""
import enum
import uuid
from datetime import datetime

import sqlalchemy as sa
from app.models.base import Base


class PredictionStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    missed = "missed"


class WorldPrediction(Base):
    __tablename__ = "world_predictions"

    id = sa.Column(sa.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    topic = sa.Column(sa.String, nullable=False)
    prediction_text = sa.Column(sa.Text, nullable=False)
    target_date = sa.Column(sa.Date, nullable=True)
    status = sa.Column(
        sa.Enum(PredictionStatus),
        default=PredictionStatus.pending,
        nullable=False,
    )
    created_at = sa.Column(sa.DateTime, default=datetime.utcnow, nullable=False)
