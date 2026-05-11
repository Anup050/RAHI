from typing import Any
import random
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Body, File, UploadFile
from fastapi.security import OAuth2PasswordRequestForm
import os
import shutil
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import EmailStr, BaseModel

from api import deps
from core import security, email as email_utils
from core.config import settings
from models.sql_models import User
from schemas import user as user_schemas, token as token_schemas
from core.ai_warmup import trigger_ai_warmup

ADMIN_EMAIL = "rahi.healthcare.app@gmail.com"

router = APIRouter()

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class ResetPassword(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

@router.post("/login", response_model=token_schemas.Token)
async def login_access_token(
    db: AsyncSession = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
    background_tasks: BackgroundTasks = None
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not user.is_active:
        raise HTTPException(
            status_code=400, 
            detail="Your account is blocked. Please contact admin at rahi.healthcare.app@gmail.com for assistance."
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    if background_tasks:
        trigger_ai_warmup(background_tasks)

    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "age": user.age,
            "gender": user.gender,
            "role": user.role,
            "is_approved": user.is_approved,
        }
    }

@router.post("/register-request", response_model=Any)
async def register_request(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: user_schemas.UserCreate,
    background_tasks: BackgroundTasks
) -> Any:
    """
    Register new user step 1: Create inactive user, generate OTP, send email.
    """
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    if user and user.is_active:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    otp_code = str(random.randint(100000, 999999))
    otp_hash = security.get_password_hash(otp_code)
    otp_expires = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=10)

    if not user:
        user = User(
            email=user_in.email,
            full_name=user_in.full_name,
            role=user_in.role,
            is_active=False,
            phone_number=user_in.phone_number,
            age=user_in.age,
            gender=user_in.gender,
            otp_code=otp_hash,
            otp_expires_at=otp_expires,
            specialization=user_in.specialization,
            experience_years=user_in.experience_years,
            hospital_name=user_in.hospital_name,
            hospital_address=user_in.hospital_address,
            profile_summary=user_in.profile_summary,
            available_time=user_in.available_time,
            is_approved=False
        )
        user.set_password(user_in.password)
        db.add(user)
        await db.flush() # To get the auto-generated user.id
        prefix = 'DOC' if user.role == 'doctor' else 'PAT'
        user.rahi_id = f"RAHI-{prefix}-{user.id:04d}"
        db.add(user)
    else:
        user.otp_code = otp_hash
        user.otp_expires_at = otp_expires
        user.full_name = user_in.full_name
        user.set_password(user_in.password)
        db.add(user)
        # If user exists but is inactive, they might not have a rahi_id yet if they were an old record
        if not user.rahi_id:
            prefix = 'DOC' if user.role == 'doctor' else 'PAT'
            user.rahi_id = f"RAHI-{prefix}-{user.id:04d}"
            db.add(user)

    await db.commit()
    await email_utils.send_otp_email(user_in.email, otp_code, background_tasks, subject="RAHI Health - Registration Verification")
    trigger_ai_warmup(background_tasks)
    
    return {"message": "OTP sent to email", "status": "sent"}

@router.post("/register-verify", response_model=token_schemas.Token)
async def register_verify(
    *,
    db: AsyncSession = Depends(deps.get_db),
    verify_in: OTPVerify,
    background_tasks: BackgroundTasks
) -> Any:
    """
    Verify registration OTP and activate user.
    """
    result = await db.execute(select(User).where(User.email == verify_in.email))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_active:
        raise HTTPException(status_code=400, detail="User already active")

    if not user.otp_code or not user.otp_expires_at or datetime.now(timezone.utc).replace(tzinfo=None) > user.otp_expires_at:
        raise HTTPException(status_code=400, detail="OTP expired or invalid")
    
    if not security.verify_password(verify_in.otp, user.otp_code):
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    user.is_active = True
    user.otp_code = None
    user.otp_expires_at = None
    db.add(user)
    
    # If it's a doctor, notify admins
    if user.role == 'doctor':
        from models.sql_models import Notification as NotificationModel
        # Create system notification for admins
        print(f"DEBUG: Creating admin notification for doctor {user.full_name}")
        admin_notif = NotificationModel(
            title="New Doctor Registration",
            message=f"Dr. {user.full_name} has registered and is awaiting approval.",
            type="registration",
            target_role="admin",
            created_at=datetime.now(timezone.utc).replace(tzinfo=None)
        )
        db.add(admin_notif)
        print(f"DEBUG: Admin notification created. Sending emails...")
        
        # Send Email to all Admins
        admin_res = await db.execute(select(User).where(User.role == 'admin'))
        admins = admin_res.scalars().all()
        
        if not admins:
            # Fallback: Send to platform email if no admins registered yet
            await email_utils.send_admin_new_registration_notification(
                settings.MAIL_FROM,
                user.full_name,
                user.email,
                user.specialization,
                background_tasks
            )
        else:
            for admin in admins:
                await email_utils.send_admin_new_registration_notification(
                    admin.email,
                    user.full_name,
                    user.email,
                    user.specialization,
                    background_tasks
                )


    await db.commit()
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "age": user.age,
            "gender": user.gender,
            "role": user.role,
            "is_approved": user.is_approved,
        }
    }

@router.post("/forgot-password", response_model=Any)
async def forgot_password(
    *,
    db: AsyncSession = Depends(deps.get_db),
    email: EmailStr = Body(..., embed=True),
    background_tasks: BackgroundTasks
) -> Any:
    """
    Request password reset OTP.
    """
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    otp_code = str(random.randint(100000, 999999))
    user.otp_code = security.get_password_hash(otp_code)
    user.otp_expires_at = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=10)
    db.add(user)
    await db.commit()

    await email_utils.send_otp_email(email, otp_code, background_tasks, subject="RAHI Health - Password Reset OTP")

    return {"message": "OTP sent to email", "status": "sent"}

@router.post("/reset-password", response_model=Any)
async def reset_password(
    *,
    db: AsyncSession = Depends(deps.get_db),
    reset_in: ResetPassword
) -> Any:
    """
    Reset password with OTP.
    """
    result = await db.execute(select(User).where(User.email == reset_in.email))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.otp_code or not user.otp_expires_at or datetime.now(timezone.utc).replace(tzinfo=None) > user.otp_expires_at:
        raise HTTPException(status_code=400, detail="OTP expired or invalid")

    if not security.verify_password(reset_in.otp, user.otp_code):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    user.set_password(reset_in.new_password)
    user.otp_code = None
    user.otp_expires_at = None
    db.add(user)
    await db.commit()

    return {"message": "Password updated successfully"}

@router.post("/login-request", response_model=Any)
async def login_request(
    *,
    db: AsyncSession = Depends(deps.get_db),
    email: EmailStr = Body(..., embed=True),
    background_tasks: BackgroundTasks
) -> Any:
    """
    Request OTP for passwordless login (Mobile App).
    """
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.is_active:
        raise HTTPException(
            status_code=400, 
            detail="Your account is blocked. Please contact admin at rahi.healthcare.app@gmail.com for assistance."
        )
    
    otp_code = str(random.randint(100000, 999999))
    user.otp_code = security.get_password_hash(otp_code)
    user.otp_expires_at = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=10)
    db.add(user)
    await db.commit()

    await email_utils.send_otp_email(email, otp_code, background_tasks, subject="RAHI Health - Login OTP")
    trigger_ai_warmup(background_tasks)

    return {"message": "OTP sent to email", "status": "sent"}

@router.post("/login-verify", response_model=token_schemas.Token)
async def login_verify(
    *,
    db: AsyncSession = Depends(deps.get_db),
    verify_in: OTPVerify,
    background_tasks: BackgroundTasks
) -> Any:
    """
    Verify login OTP and return token.
    """
    result = await db.execute(select(User).where(User.email == verify_in.email))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.otp_code or not user.otp_expires_at or datetime.now(timezone.utc).replace(tzinfo=None) > user.otp_expires_at:
        raise HTTPException(status_code=400, detail="OTP expired or invalid")
    
    if not security.verify_password(verify_in.otp, user.otp_code):
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    user.otp_code = None
    user.otp_expires_at = None
    db.add(user)
    await db.commit()
    
    trigger_ai_warmup(background_tasks)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "age": user.age,
            "gender": user.gender,
            "role": user.role,
            "is_approved": user.is_approved,
        }
    }

@router.post('/upload-verification')
async def upload_verification(
    *,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    govt_id: UploadFile = File(...),
    clinic_id: UploadFile = File(...)
) -> Any:
    "Upload verification documents for a doctor."
    if current_user.role != 'doctor':
        raise HTTPException(status_code=403, detail='Only doctors need to upload verification documents')

    upload_dir = 'static/uploads'
    os.makedirs(upload_dir, exist_ok=True)

    govt_filename = f'user_{current_user.id}_govt_{govt_id.filename.replace(" ", "_")}'
    govt_path = os.path.join(upload_dir, govt_filename)
    with open(govt_path, 'wb') as buffer:
        shutil.copyfileobj(govt_id.file, buffer)

    clinic_filename = f'user_{current_user.id}_clinic_{clinic_id.filename.replace(" ", "_")}'
    clinic_path = os.path.join(upload_dir, clinic_filename)
    with open(clinic_path, 'wb') as buffer:
        shutil.copyfileobj(clinic_id.file, buffer)

    current_user.govt_id_url = f'/static/uploads/{govt_filename}'
    current_user.clinic_id_url = f'/static/uploads/{clinic_filename}'
    db.add(current_user)
    await db.commit()

    return {
        'status': 'success',
        'message': 'Documents uploaded successfully. Admin will review them.',
        'govt_id_url': current_user.govt_id_url,
        'clinic_id_url': current_user.clinic_id_url
    }

@router.get("/warm-ai")
async def warm_ai(background_tasks: BackgroundTasks) -> Any:
    """
    Manually trigger AI engine warmup (used by frontend on app start).
    """
    trigger_ai_warmup(background_tasks)
    return {"status": "warmup_triggered"}
