from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime
import enum
from db.base import Base
from core.security import verify_password, get_password_hash

class UserRole(str, enum.Enum):
    DOCTOR = "doctor"
    PATIENT = "patient"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    role = Column(String, default=UserRole.PATIENT)
    is_active = Column(Boolean, default=True)
    phone_number = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    otp_code = Column(String, nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)

    def set_password(self, password: str):
        self.hashed_password = get_password_hash(password)

    def verify_password(self, password: str) -> bool:
        return verify_password(password, self.hashed_password)

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, index=True)
    doctor_id = Column(Integer, index=True)
    time = Column(String) # Storing as string for simplicity in MVP
    status = Column(String, default="scheduled")
    confirmed = Column(Boolean, default=False)
    patient_name = Column(String, nullable=True)
    type = Column(String, default="Video Consult")
    reason = Column(String, nullable=True)

class Prescription(Base):
    __tablename__ = "prescriptions"
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, index=True)
    medicine = Column(String)
    dosage = Column(String)
