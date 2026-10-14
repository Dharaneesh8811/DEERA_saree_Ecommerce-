import asyncio
from sqlalchemy import text
from app.db.session import AsyncSessionLocal

OLD_IP = "192.168.43.99"
NEW_IP = "10.50.213.99"

async def main():
    async with AsyncSessionLocal() as session:
        try:
            for table in ("hero", "product_images", "categories"):
                result = await session.execute(
                    text(
                        f"UPDATE {table} "
                        "SET image_url = replace(image_url, :old_ip, :new_ip) "
                        "WHERE image_url LIKE :pattern"
                    ),
                    {
                        "old_ip": OLD_IP,
                        "new_ip": NEW_IP,
                        "pattern": f"%{OLD_IP}%",
                    },
                )
                print(f"{table}: {result.rowcount} URL(s) updated")

            await session.commit()
            print("Image URL migration completed successfully.")

        except Exception:
            await session.rollback()
            raise

    await session.close()

if __name__ == "__main__":
    asyncio.run(main())
