import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.admin import Admin
from app.core.security import create_access_token


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

        token = create_access_token(admin)

        print("JWT CREATED SUCCESSFULLY")
        print("TOKEN LENGTH =", len(token))


asyncio.run(main())
