"""create return requests table

Revision ID: a94e0186e040
Revises: 8b0d4ce73684
Create Date: 2026-09-27 00:00:00.000000

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "a94e0186e040"
down_revision = "8b0d4ce73684"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "return_requests",
        sa.Column("order_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("order_item_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("customer_phone", sa.String(length=30), nullable=False),
        sa.Column("request_type", sa.String(length=20), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("admin_notes", sa.Text(), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["order_item_id"], ["order_items.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_return_requests_order_id", "return_requests", ["order_id"])
    op.create_index("ix_return_requests_order_item_id", "return_requests", ["order_item_id"])
    op.create_index("ix_return_requests_customer_phone", "return_requests", ["customer_phone"])


def downgrade() -> None:
    op.drop_index("ix_return_requests_customer_phone", table_name="return_requests")
    op.drop_index("ix_return_requests_order_item_id", table_name="return_requests")
    op.drop_index("ix_return_requests_order_id", table_name="return_requests")
    op.drop_table("return_requests")