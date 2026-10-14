import asyncio
from sqlalchemy import text
from app.db.session import AsyncSessionLocal

async def main():
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            text("SELECT id, name, image_url FROM categories ORDER BY id")
        )

        for row in result.fetchall():
            print(row)

if __name__ == "__main__":
    asyncio.run(main())
