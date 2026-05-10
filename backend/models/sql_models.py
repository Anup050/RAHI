from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime, Text, Float
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
    rahi_id = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    role = Column(String, default=UserRole.PATIENT)
    is_active = Column(Boolean, default=True)
    phone_number = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    otp_code = Column(String, nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    
    # Doctor Specific Fields
    specialization = Column(String, nullable=True)
    experience_years = Column(Integer, nullable=True)
    hospital_name = Column(String, nullable=True)
    hospital_address = Column(String, nullable=True)
    is_approved = Column(Boolean, default=False)
    govt_id_url = Column(String, nullable=True) # Govt ID proof document
    clinic_id_url = Column(String, nullable=True) # Clinic/Hospital ID card document
    profile_summary = Column(Text, nullable=True)
    available_time = Column(String, nullable=True) # e.g. "9:00 AM - 5:00 PM"
    notifications_enabled = Column(Boolean, default=True)
    push_token = Column(String, nullable=True)
    avg_rating = Column(Float, nullable=True)
    review_count = Column(Integer, default=0)

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
    has_review = Column(Boolean, default=False)
    rating = Column(Integer, nullable=True)

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, index=True)
    patient_id = Column(Integer, index=True)
    doctor_id = Column(Integer, index=True)
    rating = Column(Integer)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime)

class Prescription(Base):
    __tablename__ = "prescriptions"
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, index=True, nullable=True)
    patient_id = Column(Integer, index=True)
    doctor_id = Column(Integer, index=True)
    medicine = Column(String)
    dosage = Column(String)
    frequency = Column(String) # e.g., "1-0-1"
    duration_days = Column(Integer)
    start_date = Column(DateTime)
    created_at = Column(DateTime)

class PillLog(Base):
    __tablename__ = "pill_logs"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, index=True)
    prescription_id = Column(Integer, index=True)
    date = Column(String) # YYYY-MM-DD
    time_of_day = Column(String) # Morning, Afternoon, Night
    taken_at = Column(DateTime)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True) # If null, it's for all doctors/admins
    title = Column(String)
    message = Column(String)
    type = Column(String) # 'appointment', 'system', etc.
    target_role = Column(String, nullable=True) # 'doctor', 'admin', or null for both
    is_read = Column(Boolean, default=False) # Keep as legacy/default
    created_at = Column(DateTime, default=None) # Will set in service

class NotificationRead(Base):
    __tablename__ = "notification_reads"
    user_id = Column(Integer, primary_key=True)
    notification_id = Column(Integer, primary_key=True)
    read_at = Column(DateTime, default=None)
