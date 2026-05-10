import asyncio
from sqlalchemy import text
from db.session import get_db, engine
from models.sql_models import User

async def migrate_db():
    print("Migrating Database Schema...")
    async with engine.begin() as conn:
        try:
            # Update Users
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR;"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR;"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS avg_rating FLOAT;"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS rahi_id VARCHAR UNIQUE;"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token VARCHAR;"))
            
            # Backfill existing users with RAHI IDs
            await conn.execute(text("""
                UPDATE users 
                SET rahi_id = 'RAHI-' || 
                    CASE WHEN role = 'doctor' THEN 'DOC' ELSE 'PAT' END || 
                    '-' || LPAD(id::text, 4, '0')
                WHERE rahi_id IS NULL;
            """))
            
            # Update Appointments
            await conn.execute(text("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS has_review BOOLEAN DEFAULT FALSE;"))
            await conn.execute(text("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS rating INTEGER;"))
            
            # Update Notifications
            await conn.execute(text("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_role VARCHAR;"))
            
            # Create Reviews Table
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS reviews (
                    id SERIAL PRIMARY KEY,
                    appointment_id INTEGER,
                    patient_id INTEGER,
                    doctor_id INTEGER,
                    rating INTEGER,
                    comment TEXT,
                    created_at TIMESTAMP
                );
            """))

            # Create Notification Reads Table
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS notification_reads (
                    user_id INTEGER,
                    notification_id INTEGER,
                    read_at TIMESTAMP,
                    PRIMARY KEY (user_id, notification_id)
                );
            """))
            
            print("SUCCESS: Database schema updated.")
        except Exception as e:
            print(f"FAILURE: Migration failed: {e}")

if __name__ == "__main__":
    import sys
    import os
    # Add project root to path for imports to work
    sys.path.append(os.getcwd())
    
    asyncio.run(migrate_db())
