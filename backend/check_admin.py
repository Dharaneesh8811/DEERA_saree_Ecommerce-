import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.admin import Admin
from app.core.security import verify_password


async def main():
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Admin).where(Admin.email == "admin@derasilk.com")
        )

        admin = result.scalar_one_or_none()

        if admin is None:
            print("ADMIN NOT FOUND")
            return

        print("ADMIN FOUND")
        print("Email:", admin.email)
        print("Name:", admin.full_name)
        print("Role:", admin.role)
        print("Active:", admin.is_active)

        password = input("Enter admin password to test: ")

        if verify_password(password, admin.password_hash):
            print("PASSWORD MATCHES")
        else:
            print("PASSWORD DOES NOT MATCH")


asyncio.run(main())
