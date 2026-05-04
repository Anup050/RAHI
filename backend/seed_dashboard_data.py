import asyncio
import sys
import os
from datetime import datetime, timedelta

# Add current directory to path so imports work
sys.path.append(os.getcwd())

from sqlalchemy.future import select
from db.session import AsyncSessionLocal
from models.sql_models import User, Appointment, UserRole
from core.security import get_password_hash

async def seed_data():
    print("Seeding dashboard data...")
    async with AsyncSessionLocal() as session:
        # 1. Ensure the authorized doctor exists
        doctor_email = "dubeyanupkumar349@gmail.com"
        result = await session.execute(select(User).where(User.email == doctor_email))
        doctor = result.scalars().first()
        
        if not doctor:
            print(f"Creating doctor user: {doctor_email}")
            doctor = User(
                email=doctor_email,
                full_name="Dr. Anup Kumar",
                hashed_password=get_password_hash("password123"),
                role=UserRole.DOCTOR,
                is_active=True
            )
            session.add(doctor)
            await session.commit()
            await session.refresh(doctor)
        
        # 2. Create some patient users
        patients = [
            {"email": "patient1@example.com", "name": "Rahul Sharma"},
            {"email": "patient2@example.com", "name": "Priya Singh"},
            {"email": "patient3@example.com", "name": "Amit Patel"}
        ]
        
        patient_objs = []
        for p in patients:
            res = await session.execute(select(User).where(User.email == p["email"]))
            p_obj = res.scalars().first()
            if not p_obj:
                print(f"Creating patient: {p['name']}")
                p_obj = User(
                    email=p["email"],
                    full_name=p["name"],
                    hashed_password=get_password_hash("password123"),
                    role=UserRole.PATIENT,
                    is_active=True
                )
                session.add(p_obj)
            patient_objs.append(p_obj)
        
        await session.commit()
        
        # 3. Create sample appointments
        # Note: We need to re-fetch patients if they were already there to get IDs
        # (Already handled by append)
        
        sample_appointments = [
            {"name": "Rahul Sharma", "status": "Confirmed", "type": "Follow-up", "time": "10:30 AM"},
            {"name": "Priya Singh", "status": "Pending", "type": "Check-up", "time": "11:45 AM"},
            {"name": "Amit Patel", "status": "Completed", "type": "Consultation", "time": "09:00 AM"},
            {"name": "Rahul Sharma", "status": "Pending", "type": "Lab Test", "time": "02:00 PM"},
            {"name": "Unknown Patient", "status": "Pending", "type": "Emergency", "time": "04:30 PM"}
        ]
        
        print("Creating sample appointments...")
        for i, appt in enumerate(sample_appointments):
            # Pick a patient ID or use None
            p_id = patient_objs[i % len(patient_objs)].id if i < len(patient_objs) else None
            
            new_appt = Appointment(
                patient_id=p_id,
                doctor_id=doctor.id if appt["status"] != "Pending" else None,
                patient_name=appt["name"],
                status=appt["status"],
                type=appt["type"],
                time=appt["time"],
                confirmed=(appt["status"] == "Confirmed" or appt["status"] == "Completed"),
                reason="Routine checkup for dashboard demonstration."
            )
            session.add(new_appt)
            
        await session.commit()
        print("Seeding completed successfully!")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_data())
