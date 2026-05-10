import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from dotenv import load_dotenv
from models.sql_models import User, UserRole

load_dotenv(dotenv_path="c:/Users/dubey/OneDrive/Desktop/RAHI/backend/.env")

DATABASE_URL = f"postgresql+asyncpg://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT')}/{os.getenv('POSTGRES_DB')}"

async def test_get_doctors():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as db:
        query = select(User).where(User.role == UserRole.DOCTOR, User.is_approved == True)
        result = await db.execute(query)
        doctors = result.scalars().all()
        
        print(f"\nFound {len(doctors)} approved doctors:")
        for d in doctors:
            print(f"- {d.full_name} ({d.specialization})")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_get_doctors())
