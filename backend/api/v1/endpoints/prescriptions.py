from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_
from datetime import datetime, timedelta

from db.session import get_db
from models.sql_models import User, Prescription, PillLog
from api.deps import get_current_user
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# --- Pydantic Schemas ---
class MedicineInput(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str # e.g. "5 days"

class PrescriptionCreate(BaseModel):
    patient_id: int
    medicines: List[MedicineInput]

class PillLogCreate(BaseModel):
    prescription_id: int
    time_of_day: str # "Morning", "Afternoon", "Night"

# --- Endpoints ---

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_prescription(
    prescription_in: PrescriptionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["doctor", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Check if patient exists
    patient = await db.get(User, prescription_in.patient_id)
    if not patient or patient.role != "patient":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    created_prescriptions = []
    for med in prescription_in.medicines:
        # Parse duration
        duration_days = 5 # Default
        try:
            if "day" in med.duration.lower():
                duration_days = int(med.duration.split()[0])
            elif "week" in med.duration.lower():
                duration_days = int(med.duration.split()[0]) * 7
        except:
            pass

        new_prescription = Prescription(
            patient_id=prescription_in.patient_id,
            doctor_id=current_user.id,
            medicine=med.name,
            dosage=med.dosage,
            frequency=med.frequency,
            duration_days=duration_days,
            start_date=datetime.utcnow(),
            created_at=datetime.utcnow()
        )
        db.add(new_prescription)
        created_prescriptions.append(new_prescription)
    
    await db.commit()
    return {"status": "success", "message": f"{len(created_prescriptions)} medicines prescribed."}

@router.get("/patient/{patient_id}")
async def get_patient_prescriptions(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["doctor", "admin"] and current_user.id != patient_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        
    result = await db.execute(
        select(Prescription)
        .where(Prescription.patient_id == patient_id)
        .order_by(Prescription.created_at.desc())
    )
    return result.scalars().all()

@router.get("/reminders")
async def get_reminders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only patients have reminders")
        
    # Get active prescriptions
    result = await db.execute(
        select(Prescription)
        .where(Prescription.patient_id == current_user.id)
    )
    prescriptions = result.scalars().all()
    
    active_prescriptions = []
    now = datetime.utcnow()
    for p in prescriptions:
        if p.start_date and p.duration_days:
            end_date = p.start_date + timedelta(days=p.duration_days)
            if now <= end_date:
                active_prescriptions.append(p)
                
    # Get logs for today
    today_str = now.strftime("%Y-%m-%d")
    logs_result = await db.execute(
        select(PillLog)
        .where(
            and_(
                PillLog.patient_id == current_user.id,
                PillLog.date == today_str
            )
        )
    )
    logs = logs_result.scalars().all()
    
    # Organize reminders
    reminders = []
    for p in active_prescriptions:
        # Determine times based on frequency (e.g., 1-0-1 -> Morning, Night)
        freq_parts = p.frequency.split('-')
        if len(freq_parts) == 3:
            times = []
            if freq_parts[0] != '0': times.append("Morning")
            if freq_parts[1] != '0': times.append("Afternoon")
            if freq_parts[2] != '0': times.append("Night")
        else:
            # Fallback
            times = ["Morning"]
            
        for t in times:
            # Check if taken
            is_taken = any(log.prescription_id == p.id and log.time_of_day == t for log in logs)
            reminders.append({
                "prescription_id": p.id,
                "medicine": p.medicine,
                "dosage": p.dosage,
                "time_of_day": t,
                "is_taken": is_taken
            })
            
    return reminders

@router.post("/log")
async def log_pill(
    log_in: PillLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only patients can log pills")
        
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    
    # Check if already logged
    existing_result = await db.execute(
        select(PillLog)
        .where(
            and_(
                PillLog.patient_id == current_user.id,
                PillLog.prescription_id == log_in.prescription_id,
                PillLog.date == today_str,
                PillLog.time_of_day == log_in.time_of_day
            )
        )
    )
    existing = existing_result.scalars().first()
    
    if existing:
        return {"status": "success", "message": "Already logged"}
        
    new_log = PillLog(
        patient_id=current_user.id,
        prescription_id=log_in.prescription_id,
        date=today_str,
        time_of_day=log_in.time_of_day,
        taken_at=datetime.utcnow()
    )
    db.add(new_log)
    await db.commit()
    
    return {"status": "success", "message": "Pill logged successfully"}

@router.get("/history/me")
async def get_my_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the logged-in patient's own pill adherence history.
    """
    if current_user.role != "patient":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only patients can access this")
        
    logs_result = await db.execute(
        select(PillLog)
        .where(PillLog.patient_id == current_user.id)
        .order_by(PillLog.taken_at.desc())
    )
    logs = logs_result.scalars().all()
    
    history = []
    for log in logs:
        p = await db.get(Prescription, log.prescription_id)
        if p:
            history.append({
                "id": log.id,
                "medicine": p.medicine,
                "dosage": p.dosage,
                "date": log.date,
                "time_of_day": log.time_of_day,
                "taken_at": log.taken_at
            })
            
    return history

@router.get("/history/{patient_id}")
async def get_patient_history(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["doctor", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        
    logs_result = await db.execute(
        select(PillLog)
        .where(PillLog.patient_id == patient_id)
        .order_by(PillLog.taken_at.desc())
    )
    logs = logs_result.scalars().all()
    
    # Could join with prescriptions to get medicine names
    history = []
    for log in logs:
        # Get prescription details
        p = await db.get(Prescription, log.prescription_id)
        if p:
            history.append({
                "id": log.id,
                "medicine": p.medicine,
                "date": log.date,
                "time_of_day": log.time_of_day,
                "taken_at": log.taken_at
            })
            
    return history
