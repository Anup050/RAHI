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
    patient_rahi_id: Optional[str] = None # Added for frontend display
    doctor_name: Optional[str] = None # Helper for frontend
    has_review: Optional[bool] = False
    rating: Optional[int] = None

class AppointmentCreate(BaseModel):
    patient_name: str 
    doctor_id: Optional[int] = None
    time: str
    type: str # 'Video Consult' or 'In-Person'
    reason: str
    suggested_slot: Optional[str] = None # Used to confirm a suggested slot

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    confirmed: Optional[bool] = None
    reason: Optional[str] = None

class AppointmentInDBBase(AppointmentBase):
    id: int
    
    class Config:
        from_attributes = True

class Appointment(AppointmentInDBBase):
    patient: Optional[str] = None # derived
    type: Optional[str] = None # derived
    reason: Optional[str] = None # derived
