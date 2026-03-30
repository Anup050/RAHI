from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from api import deps
from models.sql_models import Appointment, User
from schemas import appointment as appointment_schemas

router = APIRouter()

@router.get("/", response_model=List[appointment_schemas.Appointment])
async def read_appointments(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve appointments.
    """
    # For MVP, just return all appointments or filter by user if simple enough
    # Assuming doctor sees all appointments for now or their own
    query = select(Appointment)
    # if current_user.role == "doctor":
    #     query = query.where(Appointment.doctor_id == current_user.id)
    
    result = await db.execute(query.offset(skip).limit(limit))
    appointments = result.scalars().all()
    
    # Map to schema manually if needed or let pydantic handle
    # We need to ensure schema matches what we return. 
    # Since we added fields to model, it should be fine.
    # We hack the 'patient' field in schema to match 'patient_name' in model
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

@router.post("/", response_model=appointment_schemas.Appointment)
async def create_appointment(
    *,
    db: AsyncSession = Depends(deps.get_db),
    appointment_in: appointment_schemas.AppointmentCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new appointment.
    """
    appointment = Appointment(
        doctor_id=current_user.id, # Assigning creating user as doctor for now
        time=appointment_in.time,
        patient_name=appointment_in.patient_name,
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
