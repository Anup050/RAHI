import asyncio
import sys
import os

sys.path.append(os.getcwd())
from db.session import AsyncSessionLocal
from sqlalchemy.future import select
from sqlalchemy.orm import aliased
from models.sql_models import Appointment, User

async def main():
    async with AsyncSessionLocal() as db:
        Doctor = aliased(User)
        query = select(Appointment, Doctor.full_name.label("doctor_name")).outerjoin(
            Doctor, Appointment.doctor_id == Doctor.id
        ).where(Appointment.id.in_([26, 27, 28, 30, 31]))
        res = await db.execute(query)
        for row in res.all():
            print("Row ID:", row.Appointment.id, "Status:", row.Appointment.status, "Doc_ID:", row.Appointment.doctor_id, "Doc_Name:", row.doctor_name)

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
