import asyncio
import getpass

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.admin import Admin, AdminRole
from app.core.security import hash_password


async def main():
    print("Starting admin creation...")

    email = input("Admin email: ").strip()
    full_name = input("Admin full name: ").strip()
    password = getpass.getpass("Admin password: ")

    async with AsyncSessionLocal() as db:
        existing_admin = await db.scalar(
            select(Admin).where(Admin.email == email)
        )

        if existing_admin:
            print("An admin with this email already exists.")
            return

        admin = Admin(
            email=email,
            password_hash=hash_password(password),
            full_name=full_name,
            role=AdminRole.ADMIN,
            is_active=True,
        )

        db.add(admin)
        await db.commit()

        print("Admin created successfully.")


asyncio.run(main())
