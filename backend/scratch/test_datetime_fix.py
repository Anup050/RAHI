import asyncio
from datetime import datetime, timezone, timedelta
from sqlalchemy import create_engine, select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from models.sql_models import User
from core.config import settings

async def test_datetime_save():
    # Use the same database URL as the app
    DATABASE_URL = settings.SQLALCHEMY_DATABASE_URI
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    engine = create_async_engine(DATABASE_URL)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as db:
        # Try to find a user and update their otp_expires_at with a naive UTC datetime
        result = await db.execute(select(User).limit(1))
        user = result.scalars().first()
        
        if not user:
            print("No user found in DB to test with.")
            return

        print(f"Testing with user: {user.email}")
        
        # This is what I've implemented: naive UTC
        naive_utc = datetime.now(timezone.utc).replace(tzinfo=None)
        user.otp_expires_at = naive_utc
        
        try:
            db.add(user)
            await db.commit()
            print("Successfully saved naive UTC datetime to DB.")
        except Exception as e:
            print(f"Failed to save naive UTC datetime: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(test_datetime_save())
