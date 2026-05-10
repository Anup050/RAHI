import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv(dotenv_path="c:/Users/dubey/OneDrive/Desktop/RAHI/backend/.env")

DATABASE_URL = f"postgresql+asyncpg://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT')}/{os.getenv('POSTGRES_DB')}"

async def check_doctors():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT id, full_name, email, role, is_approved FROM users WHERE role = 'doctor' OR role = 'admin'"))
        rows = result.all()
        print("\nUsers found:")
        for row in rows:
            print(f"ID: {row.id} | Name: {row.full_name} | Email: {row.email} | Role: {row.role} | Approved: {row.is_approved}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_doctors())
