from typing import Optional
from pydantic import BaseModel, EmailStr
from models.sql_models import UserRole

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.PATIENT
    phone_number: Optional[str] = None
    age: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    age: Optional[int] = None
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: Optional[int] = None
    is_active: Optional[bool] = True

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str
