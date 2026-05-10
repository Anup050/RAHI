from typing import Optional
from pydantic import BaseModel, EmailStr
from models.sql_models import UserRole

class UserBase(BaseModel):
    email: EmailStr
    rahi_id: Optional[str] = None
    full_name: Optional[str] = None
    role: UserRole = UserRole.PATIENT
    phone_number: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    hospital_name: Optional[str] = None
    hospital_address: Optional[str] = None
    is_approved: Optional[bool] = False
    govt_id_url: Optional[str] = None
    clinic_id_url: Optional[str] = None
    profile_summary: Optional[str] = None
    available_time: Optional[str] = None
    notifications_enabled: Optional[bool] = True
    avg_rating: Optional[float] = None
    review_count: Optional[int] = 0
    push_token: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    password: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = None
    hospital_name: Optional[str] = None
    hospital_address: Optional[str] = None
    is_approved: Optional[bool] = None
    govt_id_url: Optional[str] = None
    clinic_id_url: Optional[str] = None
    profile_summary: Optional[str] = None
    available_time: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    push_token: Optional[str] = None

class UserInDBBase(UserBase):
    id: Optional[int] = None
    is_active: Optional[bool] = True

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str
