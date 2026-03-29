"""Add world_predictions table.

Revision ID: 0002
Revises: 0001
Create Date: 2026-03-29
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers
revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "world_predictions",
        sa.Column("id", sa.String(), nullable=False, primary_key=True),
        sa.Column("topic", sa.String(), nullable=False),
        sa.Column("prediction_text", sa.Text(), nullable=False),
        sa.Column("target_date", sa.Date(), nullable=True),
        sa.Column(
            "status",
            sa.String(),
            nullable=False,
            server_default="pending",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )


def downgrade() -> None:
    op.drop_table("world_predictions")
