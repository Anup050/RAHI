import asyncio
import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

from sqlalchemy.future import select
from db.session import AsyncSessionLocal
from models.sql_models import User

async def check_admins():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.role == 'admin'))
        admins = res.scalars().all()
        print(f"Found {len(admins)} admins:")
        for a in admins:
            print(f"- {a.email} ({a.full_name})")

if __name__ == "__main__":
    asyncio.run(check_admins())
