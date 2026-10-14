"""add content and ordering to hero records

Revision ID: 6e4c4d9a18b2
Revises: caaf0e35219b
"""

from alembic import op
import sqlalchemy as sa


revision = "6e4c4d9a18b2"
down_revision = "caaf0e35219b"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "hero",
        sa.Column(
            "heading",
            sa.String(length=160),
            nullable=False,
            server_default="Women with heritage.",
        ),
    )
    op.add_column(
        "hero",
        sa.Column(
            "description",
            sa.Text(),
            nullable=False,
            server_default=(
                "Discover timeless silk sarees rooted in craftsmanship, "
                "reimagined for the way you celebrate today."
            ),
        ),
    )
    op.add_column(
        "hero",
        sa.Column(
            "cta_text",
            sa.String(length=60),
            nullable=False,
            server_default="Explore Collection",
        ),
    )
    op.add_column(
        "hero",
        sa.Column(
            "cta_url",
            sa.String(length=2048),
            nullable=False,
            server_default="/collections",
        ),
    )
    op.add_column(
        "hero",
        sa.Column(
            "display_order",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
    )
    op.execute(
        """
        WITH ordered_heroes AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) - 1 AS position
            FROM hero
        )
        UPDATE hero
        SET display_order = ordered_heroes.position
        FROM ordered_heroes
        WHERE hero.id = ordered_heroes.id
        """
    )


def downgrade() -> None:
    op.drop_column("hero", "display_order")
    op.drop_column("hero", "cta_url")
    op.drop_column("hero", "cta_text")
    op.drop_column("hero", "description")
    op.drop_column("hero", "heading")
