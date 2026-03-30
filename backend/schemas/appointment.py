from typing import Optional
from pydantic import BaseModel

class AppointmentBase(BaseModel):
    patient_id: Optional[int] = None # For MVP, maybe pass patient info or ID
    doctor_id: Optional[int] = None
    time: str
    status: Optional[str] = "scheduled"
    confirmed: Optional[bool] = False
    # Add fields for display if not in DB, or assume they are joined
    patient_name: Optional[str] = None # Helper for frontend

class AppointmentCreate(BaseModel):
    patient_name: str # Using name for MVP since we might not have patient IDs for everyone yet
    time: str
    type: str # 'Video Consult' or 'In-Person'
    reason: str

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    confirmed: Optional[bool] = None

class AppointmentInDBBase(AppointmentBase):
    id: int
    
    class Config:
        from_attributes = True

class Appointment(AppointmentInDBBase):
    patient: str # derived
    type: str # derived
    reason: str # derived
