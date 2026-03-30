import asyncio
import sys
import os

# Add current directory to path so imports work
sys.path.append(os.getcwd())

from sqlalchemy.future import select
from db.session import AsyncSessionLocal
from models.sql_models import User
from core.security import get_password_hash

async def create_test_user():
    print("Creating test user...")
    async with AsyncSessionLocal() as session:
        email = "mobile_test@example.com"
        phone = "+919999999999"
        
        # Check if user exists
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        
        if user:
            print(f"User {email} already exists.")
            if not user.phone_number:
                print("Updating phone number...")
                user.phone_number = phone
                session.add(user)
                await session.commit()
                print("Phone number updated.")
            else:
                print(f"User already has phone: {user.phone_number}")
            return

        # Create new user
        print(f"Creating new user {email} with phone {phone}")
        new_user = User(
            email=email,
            full_name="Mobile Test User",
            hashed_password=get_password_hash("password123"),
            role="patient",
            is_active=True,
            phone_number=phone
        )
        session.add(new_user)
        await session.commit()
        print("User created successfully!")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(create_test_user())
