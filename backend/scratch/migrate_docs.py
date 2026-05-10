import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

# Load .env from the backend directory
load_dotenv(dotenv_path="c:/Users/dubey/OneDrive/Desktop/RAHI/backend/.env")

DATABASE_URL = f"postgresql+asyncpg://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT')}/{os.getenv('POSTGRES_DB')}"

async def run_migration():
    print(f"Connecting to: {os.getenv('POSTGRES_HOST')}/{os.getenv('POSTGRES_DB')}")
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.begin() as conn:
        print("Adding govt_id_url column...")
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS govt_id_url VARCHAR;"))
        
        print("Adding clinic_id_url column...")
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS clinic_id_url VARCHAR;"))
        
        print("Setting is_approved to FALSE for all doctors...")
        await conn.execute(text("UPDATE users SET is_approved = FALSE WHERE role = 'doctor';"))
        
    await engine.dispose()
    print("Migration completed successfully!")

if __name__ == "__main__":
    asyncio.run(run_migration())
