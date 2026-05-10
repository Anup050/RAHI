import asyncio
from sqlalchemy import text
from db.session import engine
from db.base import Base
from models.sql_models import PillLog, Prescription

async def migrate():
    print("Migrating Database Schema for Prescriptions...")
    async with engine.begin() as conn:
        try:
            # Create pill_logs table if it doesn't exist
            await conn.run_sync(Base.metadata.create_all)
            
            # Add columns to prescriptions table
            await conn.execute(text("ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS patient_id INTEGER;"))
            await conn.execute(text("ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS doctor_id INTEGER;"))
            await conn.execute(text("ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS frequency VARCHAR;"))
            await conn.execute(text("ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS duration_days INTEGER;"))
            await conn.execute(text("ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS start_date TIMESTAMP;"))
            await conn.execute(text("ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;"))
            
            # Create indexes for new columns if necessary
            await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_prescriptions_patient_id ON prescriptions (patient_id);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_prescriptions_doctor_id ON prescriptions (doctor_id);"))
            
            print("SUCCESS: Migrated 'prescriptions' and 'pill_logs' tables.")
        except Exception as e:
            print(f"FAILURE: Migration failed: {e}")

if __name__ == "__main__":
    import sys
    import os
    sys.path.append(os.getcwd())
    
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(migrate())
