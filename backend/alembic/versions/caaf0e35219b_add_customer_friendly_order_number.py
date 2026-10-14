
"""add customer friendly order number

Revision ID: caaf0e35219b
Revises: e01102c97116
"""

from alembic import op
import sqlalchemy as sa


revision = "caaf0e35219b"
down_revision = "e01102c97116"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create the sequence for customer-facing order numbers.
    op.execute(
        "CREATE SEQUENCE deera_order_number_seq START WITH 1"
    )

    # Add a nullable column temporarily for existing orders.
    op.add_column(
        "orders",
        sa.Column("order_number", sa.String(length=40), nullable=True),
    )

    # Assign numbers to existing orders.
    op.execute("""
        WITH numbered_orders AS (
            SELECT
                id,
                ROW_NUMBER() OVER (
                    ORDER BY created_at, id
                ) AS sequence_number
            FROM orders
        )
        UPDATE orders
        SET order_number =
            'DEERA ORDER-' || numbered_orders.sequence_number::text
        FROM numbered_orders
        WHERE orders.id = numbered_orders.id
    """)

    # Position the sequence after the existing order numbers.
    op.execute("""
        SELECT setval(
            'deera_order_number_seq',
            GREATEST(COUNT(*), 1),
            COUNT(*) > 0
        )
        FROM orders
    """)

    op.alter_column(
        "orders",
        "order_number",
        existing_type=sa.String(length=40),
        nullable=False,
        server_default=sa.text(
            "'DEERA ORDER-' || nextval('deera_order_number_seq')"
        ),
    )

    op.create_unique_constraint(
        "uq_orders_order_number",
        "orders",
        ["order_number"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_orders_order_number",
        "orders",
        type_="unique",
    )

    op.drop_column("orders", "order_number")

    op.execute(
        "DROP SEQUENCE IF EXISTS deera_order_number_seq"
    )
