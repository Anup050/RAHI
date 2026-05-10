from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from api import deps
from core.config import settings
from models.sql_models import Appointment, User
import hashlib
import jwt
import time
import uuid

router = APIRouter()

@router.get("/{appointment_id}/session")
async def get_video_session(
    appointment_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # Verify appointment exists and user is part of it
    # In a real app, you'd check if current_user is either the doctor or the patient
    # For now, we'll allow any active user with the appointment ID
    
    # Generate a unique, secure room name
    # We use a hash of the appointment ID and a secret to prevent guessing
    room_seed = f"{settings.SECRET_KEY}-{appointment_id}"
    room_name = f"RAHI-{hashlib.sha256(room_seed.encode()).hexdigest()[:12]}"
    
    # Generate a JWT if Jitsi App ID is configured
    # This is for Jitsi as a Service (JaaS) or self-hosted with JWT
    token = None
    if hasattr(settings, 'JITSI_APP_ID') and settings.JITSI_APP_ID:
        payload = {
            "aud": "jitsi",
            "iss": settings.JITSI_APP_ID,
            "sub": "*", 
            "room": room_name,
            "exp": int(time.time()) + 3600,
            "context": {
                "user": {
                    "name": current_user.full_name,
                    "email": current_user.email,
                    "avatar": ""
                },
                "features": {
                    "livestreaming": "false",
                    "recording": "false",
                    "transcription": "false",
                    "outbound-call": "false"
                }
            }
        }
        token = jwt.encode(payload, settings.JITSI_SECRET, algorithm="HS256")

    # Notify the patient that the doctor is starting the call
    if current_user.role == "doctor":
        # Get patient_id from appointment
        apt_result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
        appointment = apt_result.scalars().first()
        if appointment:
            from datetime import datetime
            from core.notifications import send_push_notification
            from models.sql_models import Notification
            call_notif = Notification(
                user_id=appointment.patient_id,
                title="Incoming Video Call",
                message=f"Doctor {current_user.full_name} is calling you for your {appointment.reason} consultation.",
                type="call",
                created_at=datetime.utcnow()
            )
            db.add(call_notif)
            
            # Send Push Notification
            patient_res = await db.execute(select(User).where(User.id == appointment.patient_id))
            patient = patient_res.scalars().first()
            if patient and patient.push_token:
                send_push_notification(
                    patient.push_token,
                    "Incoming Video Call",
                    f"Doctor {current_user.full_name} is starting your consultation.",
                    {"type": "call", "appointment_id": appointment_id}
                )
            
            await db.commit()

    return {
        "room_name": room_name,
        "token": token,
        "domain": "meet.jit.si", 
        "user_name": current_user.full_name
    }
