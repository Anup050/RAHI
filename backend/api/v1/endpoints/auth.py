from typing import Any
import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import EmailStr, BaseModel

from api import deps
from core import security, email as email_utils
from core.config import settings
from models.sql_models import User
from schemas import user as user_schemas, token as token_schemas

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
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # Authenticate User
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not user.is_active:
        # Check if they have an OTP pending (maybe they registered but didn't verify)
        # But for now, just say inactive.
        raise HTTPException(status_code=400, detail="Inactive user. Please verify your account.")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
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
    
    # Generate OTP
    otp_code = str(random.randint(100000, 999999))
    otp_hash = security.get_password_hash(otp_code)
    otp_expires = datetime.utcnow() + timedelta(minutes=10)

    if not user:
        # Create new inactive user
        user = User(
            email=user_in.email,
            full_name=user_in.full_name,
            role=user_in.role,
            is_active=False,
            phone_number=user_in.phone_number,
            age=user_in.age,
            otp_code=otp_hash,
            otp_expires_at=otp_expires
        )
        user.set_password(user_in.password)
        db.add(user)
    else:
        # User exists but inactive (retry registration)
        user.otp_code = otp_hash
        user.otp_expires_at = otp_expires
        user.full_name = user_in.full_name # Update details if changed
        user.set_password(user_in.password)
        db.add(user)

    await db.commit()
    
    # Send Email
    await email_utils.send_otp_email(user_in.email, otp_code, background_tasks, subject="RAHI Health - Registration Verification")
    
    return {"message": "OTP sent to email", "status": "sent"}

@router.post("/register-verify", response_model=token_schemas.Token)
async def register_verify(
    *,
    db: AsyncSession = Depends(deps.get_db),
    verify_in: OTPVerify
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

    if not user.otp_code or not user.otp_expires_at or datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(status_code=400, detail="OTP expired or invalid")
    
    if not security.verify_password(verify_in.otp, user.otp_code):
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Activate User
    user.is_active = True
    user.otp_code = None
    user.otp_expires_at = None
    db.add(user)
    await db.commit()
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
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
        # Don't reveal user existence? For MVP, we can error.
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate OTP
    otp_code = str(random.randint(100000, 999999))
    user.otp_code = security.get_password_hash(otp_code)
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.add(user)
    await db.commit()

    # Send Email
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

    if not user.otp_code or not user.otp_expires_at or datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(status_code=400, detail="OTP expired or invalid")

    if not security.verify_password(reset_in.otp, user.otp_code):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # Update Password
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
        raise HTTPException(status_code=400, detail="User inactive")
    
    # Generate OTP
    otp_code = str(random.randint(100000, 999999))
    user.otp_code = security.get_password_hash(otp_code)
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.add(user)
    await db.commit()

    # Send Email
    await email_utils.send_otp_email(email, otp_code, background_tasks, subject="RAHI Health - Login OTP")

    return {"message": "OTP sent to email", "status": "sent"}

@router.post("/login-verify", response_model=token_schemas.Token)
async def login_verify(
    *,
    db: AsyncSession = Depends(deps.get_db),
    verify_in: OTPVerify
) -> Any:
    """
    Verify login OTP and return token.
    """
    result = await db.execute(select(User).where(User.email == verify_in.email))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.otp_code or not user.otp_expires_at or datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(status_code=400, detail="OTP expired or invalid")
    
    if not security.verify_password(verify_in.otp, user.otp_code):
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Clear OTP
    user.otp_code = None
    user.otp_expires_at = None
    db.add(user)
    await db.commit()
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
