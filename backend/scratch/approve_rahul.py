import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv(dotenv_path="c:/Users/dubey/OneDrive/Desktop/RAHI/backend/.env")

DATABASE_URL = f"postgresql+asyncpg://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT')}/{os.getenv('POSTGRES_DB')}"

async def approve_rahul():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        print("Approving Dr. Rahul Sharma for testing...")
        await conn.execute(text("UPDATE users SET is_approved = TRUE WHERE id = 2;"))
        print("Approval complete.")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(approve_rahul())
