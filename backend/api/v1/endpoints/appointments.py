from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from api import deps
from models.sql_models import Appointment, User
from schemas import appointment as appointment_schemas

router = APIRouter()

@router.get("", response_model=List[appointment_schemas.Appointment])
async def read_appointments(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve appointments.
    Patients see only their own appointments.
    Doctors see all appointments.
    """
    query = select(Appointment)
    
    # Filter based on user role
    if current_user.role == "patient":
        query = query.where(Appointment.patient_id == current_user.id)
    elif current_user.role == "doctor":
        # Doctors see their own appointments OR unassigned ones (pending)
        from sqlalchemy import or_
        query = query.where(or_(Appointment.doctor_id == current_user.id, Appointment.doctor_id == None))
    # admin sees all
    
    result = await db.execute(query.offset(skip).limit(limit))
    appointments = result.scalars().all()
    
    return [
        {
            "id": a.id,
            "patient_id": a.patient_id,
            "doctor_id": a.doctor_id,
            "time": a.time,
            "status": a.status,
            "confirmed": a.confirmed,
            "patient": a.patient_name,
            "type": a.type,
            "reason": a.reason,
            "patient_name": a.patient_name
        }
        for a in appointments
    ]

@router.get("/patients")
async def get_doctor_patients(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get unique patients who have appointments with this doctor.
    """
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can view patient list")
    
    # Select unique patients from ALL appointments
    # Since doctors can see all pending appointments, we show all patients who have ever booked.
    query = select(User).join(
        Appointment, User.id == Appointment.patient_id
    ).distinct()
    
    result = await db.execute(query)
    patients = result.scalars().all()
    
    # Format to match frontend expectations, avoiding dummy data
    return [
        {
            "id": str(p.id),
            "name": p.full_name or "Anonymous",
            "age": p.age if p.age and p.age > 0 else None,
            "gender": None, # Remove "Other" placeholder
            "phone": p.phone_number or "Not Provided",
            "lastVisit": None, # Remove "2023-10-15" placeholder
            "status": "Active" if p.is_active else "Inactive",
            "condition": "Patient"
        }
        for p in patients
    ]

@router.post("", response_model=appointment_schemas.Appointment)
async def create_appointment(
    *,
    db: AsyncSession = Depends(deps.get_db),
    appointment_in: appointment_schemas.AppointmentCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new appointment.
    """
    # Use the logged-in user's name if patient_name is not provided
    resolved_name = appointment_in.patient_name or current_user.full_name or current_user.email
    
    appointment = Appointment(
        patient_id=current_user.id,
        doctor_id=None,  # Will be assigned when a doctor accepts
        time=appointment_in.time,
        patient_name=resolved_name,
        type=appointment_in.type,
        reason=appointment_in.reason,
        status="Pending",
        confirmed=False
    )
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)
    
    return {
            "id": appointment.id,
            "patient_id": appointment.patient_id,
            "doctor_id": appointment.doctor_id,
            "time": appointment.time,
            "status": appointment.status,
            "confirmed": appointment.confirmed,
            "patient": appointment.patient_name,
            "type": appointment.type,
            "reason": appointment.reason,
            "patient_name": appointment.patient_name
        }

class AppointmentUpdate(BaseModel):
    status: str

@router.patch("/{appointment_id}", response_model=appointment_schemas.Appointment)
async def update_appointment(
    appointment_id: int,
    appointment_in: AppointmentUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update appointment status.
    """
    # In real app, check if user is doctor or admin
    
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appointment = result.scalars().first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    appointment.status = appointment_in.status
    if appointment_in.status == 'Confirmed':
        appointment.confirmed = True
        
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)
    
    return {
            "id": appointment.id,
            "patient_id": appointment.patient_id,
            "doctor_id": appointment.doctor_id,
            "time": appointment.time,
            "status": appointment.status,
            "confirmed": appointment.confirmed,
            "patient": appointment.patient_name,
            "type": appointment.type,
            "reason": appointment.reason,
            "patient_name": appointment.patient_name
        }
