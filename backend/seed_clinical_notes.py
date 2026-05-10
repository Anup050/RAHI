import asyncio
import sys
import os

sys.path.append(os.getcwd())

from db.session import init_mongo
from models.mongo_models import ClinicalNote

async def seed_data():
    await init_mongo()
    print("Seeding clinical notes...")
    
    notes = [
        ClinicalNote(patient_id=1, doctor_id=1, content="Patient complains of severe headache and nausea.", tags=["Migraine", "Nausea"]),
        ClinicalNote(patient_id=2, doctor_id=1, content="Patient has high blood pressure and needs monitoring.", tags=["Hypertension"]),
        ClinicalNote(patient_id=3, doctor_id=1, content="Patient shows symptoms of Type 2 Diabetes.", tags=["Diabetes"]),
        ClinicalNote(patient_id=1, doctor_id=1, content="Follow up on diabetes. Blood sugar levels are stable.", tags=["Diabetes"]),
        ClinicalNote(patient_id=2, doctor_id=1, content="Patient has mild fever and cough.", tags=["Viral Fever", "Cough"]),
        ClinicalNote(patient_id=3, doctor_id=1, content="Patient complains of chest pain.", tags=["Cardiology", "Chest Pain"]),
        ClinicalNote(patient_id=1, doctor_id=1, content="Routine checkup for asthma.", tags=["Asthma"]),
        ClinicalNote(patient_id=2, doctor_id=1, content="Patient has elevated blood pressure again.", tags=["Hypertension"])
    ]
    
    for note in notes:
        await note.insert()
        
    print("Successfully seeded real clinical notes for analytics!")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_data())
