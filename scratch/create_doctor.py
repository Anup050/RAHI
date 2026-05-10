import asyncio
import os
import sys

sys.path.append(os.path.join(os.getcwd(), "backend"))

from db.session import AsyncSessionLocal
from models.sql_models import User
from core.security import get_password_hash
from sqlalchemy.future import select

async def create_doctor():
    async with AsyncSessionLocal() as session:
        email = "doctor_test@example.com"
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        
        if user:
            user.role = "doctor"
            user.is_active = True
            print(f"Updated {email} to doctor.")
        else:
            user = User(
                email=email,
                full_name="Test Doctor",
                hashed_password=get_password_hash("password123"),
                role="doctor",
                is_active=True
            )
            session.add(user)
            print(f"Created doctor {email}.")
        
        await session.commit()

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(create_doctor())
