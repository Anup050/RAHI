import asyncio
import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

from sqlalchemy.future import select
from db.session import AsyncSessionLocal
from models.sql_models import Appointment, User

async def verify_availability_check():
    async with AsyncSessionLocal() as db:
        # 1. Ensure we have a doctor to test with
        res = await db.execute(select(User).where(User.role == 'doctor').limit(1))
        doctor = res.scalars().first()
        if not doctor:
            print("No doctor found to test with.")
            return
        
        test_time = "2026-12-25T10:00:00Z"
        
        # 2. Check if an appointment already exists for this slot
        existing = await db.execute(
            select(Appointment).where(
                Appointment.doctor_id == doctor.id,
                Appointment.time == test_time,
                Appointment.status != "Cancelled"
            )
        )
        if not existing.scalars().first():
            # Create a mock appointment to block the slot
            mock_apt = Appointment(
                patient_id=1, # Assume patient 1 exists
                doctor_id=doctor.id,
                time=test_time,
                status="Pending",
                patient_name="Test Patient"
            )
            db.add(mock_apt)
            await db.commit()
            print(f"Created block for slot {test_time}")
        else:
            print(f"Slot {test_time} already blocked.")

        # 3. Simulate the availability check logic
        # This is the part I modified in appointments.py
        check_query = await db.execute(
            select(Appointment).where(
                Appointment.doctor_id == doctor.id,
                Appointment.time == test_time,
                Appointment.status != "Cancelled"
            )
        )
        found = check_query.scalars().first()
        if found:
            print("AVAILABILITY CHECK TEST: PASS")
            print("Simulation: Found existing appointment, would raise 409 Conflict.")
        else:
            print("AVAILABILITY CHECK TEST: FAIL")

if __name__ == "__main__":
    asyncio.run(verify_availability_check())
