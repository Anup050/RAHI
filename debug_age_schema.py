import asyncio
import sys
import os

# Add root to sys.path
sys.path.append(os.getcwd())

from sqlalchemy import text
from backend.db.session import engine, async_session
from backend.models.sql_models import User

async def debug_schema():
    print("--- Debugging Schema ---")
    try:
        async with engine.connect() as conn:
            # Check Columns in users table
            print("Checking columns in 'users' table...")
            result = await conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';"))
            columns = result.fetchall()
            found_age = False
            for col in columns:
                print(f" - {col[0]} ({col[1]})")
                if col[0] == 'age':
                    found_age = True
            
            if found_age:
                print("✅ 'age' column EXISTS.")
            else:
                print("❌ 'age' column MISSING.")
                return

        # Attempt to create a user with age
        print("\n--- Testing Model Insertion ---")
        async with async_session() as session:
            try:
                new_user = User(
                    email="debug_user_500@example.com",
                    full_name="Debug User",
                    hashed_password="hashed_password",
                    role="patient",
                    age=99,
                    phone_number="0000000000"
                )
                session.add(new_user)
                await session.commit()
                print("✅ User inserted successfully with age=99.")
                
                # Cleanup
                await session.execute(text("DELETE FROM users WHERE email='debug_user_500@example.com'"))
                await session.commit()
                print("✅ Cleanup successful.")
                
            except Exception as e:
                print(f"❌ Model Insertion FAILED: {e}")
                import traceback
                traceback.print_exc()

    except Exception as e:
        print(f"❌ Connection/Query FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(debug_schema())
