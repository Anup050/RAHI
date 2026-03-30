import asyncio
import os
import sys

# Add project root to path
sys.path.insert(0, os.getcwd())
print("STARTING TABLE CREATION", flush=True)

from db.session import engine
from db.base import Base
from models.sql_models import User, Appointment, Prescription  # Import models to register them with Base

async def init_tables():
    print("Creating tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tables created successfully.")

if __name__ == "__main__":
    asyncio.run(init_tables())
