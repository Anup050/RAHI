import sys
import os
import asyncio
from sqlalchemy import text

# Add project root
sys.path.insert(0, os.getcwd())

print("Ref: Checking imports...")
try:
    from main import app
    print("Backend 'main.py' imported successfully.")
except Exception as e:
    print(f"Failed to import main.py: {e}")
    sys.exit(1)

from db.session import engine

async def check_db():
    print("Ref: Checking Database Connection...")
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            print("Database connection successful.")
            
            # Check users table
            result = await conn.execute(text("SELECT * FROM users LIMIT 1"))
            print("'users' table exists and is accessible.")
    except Exception as e:
        print(f"Database check failed: {e}")

if __name__ == "__main__":
    asyncio.run(check_db())
