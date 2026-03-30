import asyncio
from sqlalchemy import text
from db.session import get_db, engine
from models.sql_models import User

async def migrate_db():
    print("Migrating Database Schema...")
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR;"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;"))
            print("SUCCESS: Added 'otp_code', 'otp_expires_at', and 'age' columns to 'users' table.")
        except Exception as e:
            print(f"FAILURE: Migration failed: {e}")

if __name__ == "__main__":
    import sys
    import os
    # Add project root to path for imports to work
    sys.path.append(os.getcwd())
    
    asyncio.run(migrate_db())
