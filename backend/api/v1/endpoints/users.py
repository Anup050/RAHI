from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from api import deps
from core import security
from models.sql_models import User, Notification, UserRole, Review
from models.mongo_models import ClinicalNote
from schemas import user as user_schemas
from datetime import datetime, timezone
from sqlalchemy import func

router = APIRouter()

@router.get("/doctors")
async def get_doctors(
    specialization: Optional[str] = None,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get a list of approved doctors, optionally filtered by specialization.
    """
    query = select(User).where(User.role == UserRole.DOCTOR, User.is_approved == True)
    if specialization:
        query = query.where(User.specialization.ilike(f"%{specialization}%"))
    
    result = await db.execute(query)
    doctors = result.scalars().all()
    
    results = []
    for d in doctors:
        results.append({
            "id": d.id,
            "rahi_id": d.rahi_id,
            "full_name": d.full_name,
            "email": d.email,
            "specialization": d.specialization,
            "experience_years": d.experience_years,
            "hospital_name": d.hospital_name,
            "hospital_address": d.hospital_address,
            "profile_summary": d.profile_summary,
            "available_time": d.available_time,
            "avg_rating": round(float(d.avg_rating or 0.0), 1),
            "review_count": d.review_count or 0
        })
    
    return results

@router.get("/me", response_model=user_schemas.User)
async def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.get("/{user_id}", response_model=user_schemas.User)
async def read_user_by_id(
    user_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get a specific user by id.
    """
    if current_user.role not in ["doctor", "admin"] and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/me", response_model=user_schemas.User)
async def update_user_me(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: user_schemas.UserUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update own user.
    """
    update_data = user_in.dict(exclude_unset=True, exclude={"password"})
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    if user_in.password is not None:
        current_user.set_password(user_in.password)
        
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.put("/me/password", response_model=user_schemas.User)
async def update_password_me(
    *,
    db: AsyncSession = Depends(deps.get_db),
    password_in: str = Body(..., embed=True),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update own password.
    """
    current_user.set_password(password_in)
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.post("/emergency")
async def trigger_emergency(
    background_tasks: BackgroundTasks,
    doctor_id: Optional[int] = Body(None),
    disease: Optional[str] = Body(None),
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Trigger an emergency alert for the current patient.
    """
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can trigger emergency")
    
    # Resolve doctor info if provided
    doctor_name = "Assigned Doctor"
    doctor_email = None
    if doctor_id:
        doc_res = await db.execute(select(User).where(User.id == doctor_id))
        doc = doc_res.scalars().first()
        if doc:
            doctor_name = doc.full_name
            doctor_email = doc.email

    reason_str = f" for {disease}" if disease else ""
    alert_msg = f"Patient {current_user.full_name or current_user.email} needs immediate assistance{reason_str}!"
    
    # Create a global notification for doctors
    notification = Notification(
        title="🚨 EMERGENCY ALERT",
        message=alert_msg,
        type="emergency",
        user_id=doctor_id, # Target the specific doctor if chosen, else global
        target_role="doctor",
        created_at=datetime.now(timezone.utc).replace(tzinfo=None)
    )
    db.add(notification)
    
    # Also notify Admin
    admin_notif = Notification(
        title="🚨 PLATFORM EMERGENCY",
        message=f"EMERGENCY: {alert_msg} (Target Doctor: {doctor_name})",
        type="emergency",
        user_id=None,
        target_role="admin",
        created_at=datetime.now(timezone.utc).replace(tzinfo=None)
    )
    db.add(admin_notif)
    await db.commit()
    
    # Store in medical history via ClinicalNote
    emergency_note = ClinicalNote(
        patient_id=current_user.id,
        doctor_id=doctor_id or 0,
        content=f"🚨 EMERGENCY ALERT: {alert_msg}",
        tags=["EMERGENCY", "SYSTEM"],
        created_at=datetime.now(timezone.utc).replace(tzinfo=None)
    )
    await emergency_note.insert()
    
    # Send Email Alerts
    from core import email as email_utils
    # To All Admins
    admin_res = await db.execute(select(User).where(User.role == UserRole.ADMIN))
    admins = admin_res.scalars().all()
    
    for admin in admins:
        await email_utils.send_emergency_alert(
            admin.email,
            admin.full_name or "Admin",
            current_user.full_name or current_user.email,
            disease or "Not Specified",
            doctor_name,
            background_tasks
        )
    
    # To Doctor
    if doctor_email:
        await email_utils.send_emergency_alert(
            doctor_email,
            doctor_name,
            current_user.full_name or current_user.email,
            disease or "Not Specified",
            doctor_name,
            background_tasks
        )
    
    return {"status": "success", "message": "Emergency services, Admin, and your doctor have been notified."}

@router.get("/{doctor_id}/reviews")
async def get_doctor_reviews(
    doctor_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_approved_user)
) -> Any:
    """
    Get reviews for a specific doctor.
    Patient names are anonymized as requested.
    """
    from models.sql_models import Review
    from sqlalchemy.future import select
    from sqlalchemy.orm import aliased
    
    Patient = aliased(User)
    query = select(Review, Patient.full_name).outerjoin(
        Patient, Review.patient_id == Patient.id
    ).where(Review.doctor_id == doctor_id).order_by(Review.created_at.desc())
    
    result = await db.execute(query)
    rows = result.all()
    
    reviews = []
    for r in rows:
        review = r.Review
        # Patient name is anonymous for all viewers as per requirement
        reviews.append({
            "id": review.id,
            "rating": review.rating,
            "comment": review.comment,
            "patient_name": "Anonymous Patient",
            "created_at": review.created_at
        })
        
    return reviews
