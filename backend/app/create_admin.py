import asyncio
from getpass import getpass

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.admin import Admin, AdminRole


async def create_admin() -> None:
    email = input("Admin email: ").strip().lower()
    full_name = input("Full name: ").strip()
    password = getpass("Password (minimum 12 characters): ")
    confirmation = getpass("Confirm password: ")

    if not email or not full_name:
        raise SystemExit("Email and full name are required")
    if len(password) < 12:
        raise SystemExit("Password must be at least 12 characters")
    if password != confirmation:
        raise SystemExit("Passwords do not match")

    async with AsyncSessionLocal() as db:
        existing = await db.execute(select(Admin.id).where(Admin.email == email))
        if existing.scalar_one_or_none() is not None:
            raise SystemExit("An admin with that email already exists")

        db.add(
            Admin(
                email=email,
                full_name=full_name,
                password_hash=hash_password(password),
                role=AdminRole.ADMIN,
            )
        )
        await db.commit()


if __name__ == "__main__":
    asyncio.run(create_admin())