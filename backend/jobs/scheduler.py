from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.future import select
from db.session import AsyncSessionLocal
from models.sql_models import Appointment, User
from services.sms_provider import get_sms_provider

scheduler = AsyncIOScheduler()

async def check_appointments_and_remind():
    print("--- [Scheduler] Checking for upcoming appointments... ---")
    async with AsyncSessionLocal() as session:
        # distinct logic: Find appointments that are unconfirmed (for demo)
        # In real app: Compare datetime
        result = await session.execute(select(Appointment).where(Appointment.confirmed == False))
        appointments = result.scalars().all()
        
        for apt in appointments:
            # Fetch patient to get phone number
            patient_result = await session.execute(select(User).where(User.id == apt.patient_id))
            patient = patient_result.scalars().first()
            
            if patient and patient.phone_number:
                msg = f"Reminder: You have an appointment at {apt.time}. Please confirm."
                get_sms_provider().send_sms(patient.phone_number, msg)
                
                # Mark as reminded (in real app, use a proper flag)
                # apt.confirmed = True 
                # session.add(apt)
                # await session.commit()

def start_scheduler():
    scheduler.add_job(check_appointments_and_remind, 'interval', minutes=30)
    scheduler.start()
