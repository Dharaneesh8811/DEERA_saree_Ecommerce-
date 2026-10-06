"""update category fields

Revision ID: 0bc04ab7feae
Revises: 8d6cf597c0eb
Create Date: 2026-09-30 13:52:30.933948

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0bc04ab7feae"
down_revision = "8d6cf597c0eb"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new fields temporarily as nullable
    op.add_column(
        "categories",
        sa.Column(
            "product_type",
            sa.String(length=50),
            nullable=True,
        ),
    )

    op.add_column(
        "categories",
        sa.Column(
            "saree",
            sa.String(length=100),
            nullable=True,
        ),
    )

    # Give existing categories temporary values.
    # These can be edited later from the Admin Categories page.
    op.execute(
        """
        UPDATE categories
        SET product_type = 'silk'
        WHERE product_type IS NULL
        """
    )

    op.execute(
        """
        UPDATE categories
        SET saree = 'Saree'
        WHERE saree IS NULL
        """
    )

    # Make the new fields required after existing rows have values
    op.alter_column(
        "categories",
        "product_type",
        existing_type=sa.String(length=50),
        nullable=False,
    )

    op.alter_column(
        "categories",
        "saree",
        existing_type=sa.String(length=100),
        nullable=False,
    )

    # Remove old category structure
    op.drop_index(
        op.f("ix_categories_slug"),
        table_name="categories",
    )

    op.drop_constraint(
        op.f("categories_parent_id_fkey"),
        "categories",
        type_="foreignkey",
    )

    op.drop_column(
        "categories",
        "slug",
    )

    op.drop_column(
        "categories",
        "parent_id",
    )


def downgrade() -> None:
    # Restore old fields
    op.add_column(
        "categories",
        sa.Column(
            "parent_id",
            sa.UUID(),
            autoincrement=False,
            nullable=True,
        ),
    )

    op.add_column(
        "categories",
        sa.Column(
            "slug",
            sa.VARCHAR(length=120),
            autoincrement=False,
            nullable=True,
        ),
    )

    # Generate temporary unique slugs for existing categories
    op.execute(
        """
        UPDATE categories
        SET slug = 'category-' || id::text
        WHERE slug IS NULL
        """
    )

    op.alter_column(
        "categories",
        "slug",
        existing_type=sa.VARCHAR(length=120),
        nullable=False,
    )

    op.create_foreign_key(
        op.f("categories_parent_id_fkey"),
        "categories",
        "categories",
        ["parent_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.create_index(
        op.f("ix_categories_slug"),
        "categories",
        ["slug"],
        unique=True,
    )

    op.drop_column(
        "categories",
        "saree",
    )

    op.drop_column(
        "categories",
        "product_type",
    )