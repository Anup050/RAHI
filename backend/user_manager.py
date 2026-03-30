import asyncio
import sys
import os
from sqlalchemy import text
from sqlalchemy.future import select

# Add project root to path
sys.path.append(os.getcwd())

from db.session import get_db, engine, async_session
from models.sql_models import User
from core.security import get_password_hash

async def list_users():
    async with async_session() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()
        print(f"\n--- Registered Users ({len(users)}) ---")
        for u in users:
            print(f"ID: {u.id} | Email: {u.email} | Active: {u.is_active} | Role: {u.role}")
        print("----------------------------------\n")

async def create_user(email, password):
    async with async_session() as session:
        # Check existing
        result = await session.execute(select(User).where(User.email == email))
        if result.scalars().first():
            print(f"❌ User {email} already exists.")
            return

        new_user = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name="Admin User",
            is_active=True,
            role="admin",
            phone_number="1234567890"
        )
        session.add(new_user)
        await session.commit()
        print(f"✅ User {email} created successfully!")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python user_manager.py [list|create <email> <password>]")
        sys.exit(1)

    action = sys.argv[1]
    
    if action == "list":
        asyncio.run(list_users())
    elif action == "create" and len(sys.argv) == 4:
        asyncio.run(create_user(sys.argv[2], sys.argv[3]))
    else:
        print("Invalid arguments.")
