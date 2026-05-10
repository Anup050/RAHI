import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv(dotenv_path="c:/Users/dubey/OneDrive/Desktop/RAHI/backend/.env")

DATABASE_URL = f"postgresql+asyncpg://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT')}/{os.getenv('POSTGRES_DB')}"

async def check_specializations():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT id, full_name, specialization, is_approved FROM users WHERE role = 'doctor'"))
        rows = result.all()
        print("\nDoctor specializations:")
        for row in rows:
            print(f"ID: {row.id} | Name: {row.full_name} | Specialization: {row.specialization} | Approved: {row.is_approved}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_specializations())
