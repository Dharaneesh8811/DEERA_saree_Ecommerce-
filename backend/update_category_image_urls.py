import asyncio
from sqlalchemy import text
from app.db.session import AsyncSessionLocal

OLD_PREFIX = "http://127.0.0.1:9000/dera-silk/"
NEW_PREFIX = "http://192.168.43.99:9000/dera-silk/"

async def main():
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            text("""
                UPDATE categories
                SET image_url = REPLACE(
                    image_url,
                    :old_prefix,
                    :new_prefix
                )
                WHERE image_url LIKE :pattern
            """),
            {
                "old_prefix": OLD_PREFIX,
                "new_prefix": NEW_PREFIX,
                "pattern": OLD_PREFIX + "%",
            },
        )

        await db.commit()

        print(f"Updated rows: {result.rowcount}")

if __name__ == "__main__":
    asyncio.run(main())
