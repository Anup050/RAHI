from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Body, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import timedelta

from api import deps
from core import security
from core.config import settings
from models.sql_models import User
from schemas import token as token_schemas

# DEPRECATED: Use /auth/login-request and /auth/login-verify instead (Email OTP)
router = APIRouter(deprecated=True)

@router.post("/send")
async def send_otp(
    phone_number: str = Body(..., embed=True),
) -> Any:
    """
    Send OTP to phone number. 
    Currently mocks the sending process and always assumes success.
    OTP is hardcoded to '1234' for development.
    """
    # In a real app, we would:
    # 1. Generate a random OTP
    # 2. Store it in Redis with an expiration
    # 3. Call SMS provider (Twilio/MSG91)
    
    # For MVP/Demo:
    print(f"DEBUG: sending OTP 1234 to {phone_number}")
    return {"message": "OTP sent successfully", "status": "sent"}

@router.post("/verify", response_model=token_schemas.Token)
async def verify_otp(
    phone_number: str = Body(...),
    otp: str = Body(...),
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Verify OTP and return access token.
    """
    if otp != "1234":
         raise HTTPException(status_code=400, detail="Invalid OTP")

    # Check if user exists with this phone number
    result = await db.execute(select(User).where(User.phone_number == phone_number))
    user = result.scalars().first()

    if not user:
        # For now, require registration first. 
        # Alternatively, we could auto-register here.
        raise HTTPException(
            status_code=404, 
            detail="User not found. Please register first (or Contact Admin for demo access)."
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
