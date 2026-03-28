"""Initial schema: all models + pgvector extension.

Revision ID: 0001
Revises:
Create Date: 2026-03-22
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from pgvector.sqlalchemy import Vector

# revision identifiers
revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # profiles
    op.create_table(
        "profiles",
        sa.Column("id", sa.String(), nullable=False, primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("dob", sa.Date(), nullable=False),
        sa.Column("tob", sa.Time(), nullable=True),
        sa.Column("tob_unknown", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("pob", sa.String(), nullable=False),
        sa.Column("pob_lat", sa.String(), nullable=False),
        sa.Column("pob_lon", sa.String(), nullable=False),
        sa.Column("pob_timezone", sa.String(), nullable=False),
        sa.Column("tradition", sa.String(), nullable=False, server_default="parashara"),
        sa.Column("lagna", sa.String(), nullable=True),
        sa.Column("moon_sign", sa.String(), nullable=True),
        sa.Column("dpdpa_consent", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("trial_expires_at", sa.DateTime(), nullable=False),
        sa.Column("subscription_active", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("subscription_provider", sa.String(), nullable=True),
        sa.Column("subscription_id", sa.String(), nullable=True),
        sa.Column("share_token", sa.String(), nullable=True, unique=True),
        sa.Column("schema_version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_profiles_share_token", "profiles", ["share_token"], unique=True)

    # kundalis
    op.create_table(
        "kundalis",
        sa.Column("id", sa.String(), nullable=False, primary_key=True),
        sa.Column("profile_id", sa.String(), sa.ForeignKey("profiles.id"), nullable=False, unique=True),
        sa.Column("chart_json", sa.JSON(), nullable=True),
        sa.Column("dasha_timeline_json", sa.JSON(), nullable=True),
        sa.Column("generation_status", sa.String(), nullable=True, server_default="pending"),
        sa.Column("generation_checkpoint_year", sa.Integer(), nullable=True),
        sa.Column("schema_version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    # predictions
    op.create_table(
        "predictions",
        sa.Column("id", sa.String(), nullable=False, primary_key=True),
        sa.Column("profile_id", sa.String(), sa.ForeignKey("profiles.id"), nullable=False),
        sa.Column("dasha_period", sa.String(), nullable=False),
        sa.Column("domain", sa.String(), nullable=False),
        sa.Column("predicted_year_start", sa.Integer(), nullable=False),
        sa.Column("predicted_year_end", sa.Integer(), nullable=False),
        sa.Column("text", sa.String(), nullable=False),
        sa.Column("raw_text", sa.String(), nullable=False),
        sa.Column("confidence_score", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("refreshed_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_predictions_profile_id", "predictions", ["profile_id"])

    # events
    op.create_table(
        "events",
        sa.Column("id", sa.String(), nullable=False, primary_key=True),
        sa.Column("profile_id", sa.String(), sa.ForeignKey("profiles.id"), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("event_date", sa.Date(), nullable=False),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("confirms_prediction_id", sa.String(), sa.ForeignKey("predictions.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_events_profile_id", "events", ["profile_id"])

    # session_memories
    op.create_table(
        "session_memories",
        sa.Column("id", sa.String(), nullable=False, primary_key=True),
        sa.Column("profile_id", sa.String(), sa.ForeignKey("profiles.id"), nullable=False),
        sa.Column("session_date", sa.DateTime(), nullable=False),
        sa.Column("summary_text", sa.String(), nullable=False),
        sa.Column("predictions_made", sa.JSON(), nullable=True),
        sa.Column("events_logged", sa.JSON(), nullable=True),
        sa.Column("embedding", Vector(1536), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_session_memories_profile_id", "session_memories", ["profile_id"])

    # accuracy_corpus
    op.create_table(
        "accuracy_corpus",
        sa.Column("id", sa.String(), nullable=False, primary_key=True),
        sa.Column("prediction_domain", sa.String(), nullable=False),
        sa.Column("dasha_period", sa.String(), nullable=False),
        sa.Column("confirmed_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )
    op.create_index(
        "ix_accuracy_corpus_domain_dasha",
        "accuracy_corpus",
        ["prediction_domain", "dasha_period"],
        unique=True,
    )

    # family_links
    op.create_table(
        "family_links",
        sa.Column("id", sa.String(), nullable=False, primary_key=True),
        sa.Column("primary_profile_id", sa.String(), sa.ForeignKey("profiles.id"), nullable=False),
        sa.Column("linked_profile_id", sa.String(), sa.ForeignKey("profiles.id"), nullable=False),
        sa.Column("relationship", sa.String(), nullable=False),
        sa.Column("invited_at", sa.DateTime(), nullable=True),
        sa.Column("accepted_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("family_links")
    op.drop_table("accuracy_corpus")
    op.drop_table("session_memories")
    op.drop_table("events")
    op.drop_table("predictions")
    op.drop_table("kundalis")
    op.drop_table("profiles")
    op.execute("DROP EXTENSION IF EXISTS vector")
