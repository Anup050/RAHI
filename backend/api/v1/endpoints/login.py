from typing import Any
from datetime import datetime, timedelta
import random
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import EmailStr, BaseModel

from api import deps
from core import security, email
from core.config import settings
from models.sql_models import User
from schemas import token as token_schemas

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr

class LoginVerify(BaseModel):
    email: EmailStr
    otp: str

@router.post("/login-request")
async def request_otp(
    background_tasks: BackgroundTasks,
    login_in: LoginRequest,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Request OTP for email login.
    """
    # Check if user exists
    result = await db.execute(select(User).where(User.email == login_in.email))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    # Generate 6-digit OTP
    otp_code = str(random.randint(100000, 999999))
    
    # Save to DB
    user.otp_code = security.get_password_hash(otp_code) # Hashing OTP for security
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    db.add(user)
    await db.commit()

    # Send Email
    await email.send_otp_email(login_in.email, otp_code, background_tasks)

    return {"message": "OTP sent to email", "status": "sent"}

@router.post("/login-verify", response_model=token_schemas.Token)
async def verify_otp(
    verify_in: LoginVerify,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Verify OTP and return access token.
    """
    result = await db.execute(select(User).where(User.email == verify_in.email))
    user = result.scalars().first()

    if not user:
         raise HTTPException(status_code=404, detail="User not found")

    if not user.otp_code or not user.otp_expires_at:
        raise HTTPException(status_code=400, detail="No OTP requested")

    if datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(status_code=400, detail="OTP expired")

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
