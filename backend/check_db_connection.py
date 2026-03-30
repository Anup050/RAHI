import asyncio
import sys
import os
import asyncpg
from core.config import settings

async def check_db():
    print(f"Connecting to {settings.POSTGRES_HOST}:{settings.POSTGRES_PORT} as {settings.POSTGRES_USER}...")
    try:
        conn = await asyncpg.connect(
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            database=settings.POSTGRES_DB,
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT
        )
        print("Successfully connected to PostgreSQL!")
        await conn.close()
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(check_db())
