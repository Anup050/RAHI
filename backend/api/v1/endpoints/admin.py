from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, func

from api import deps
from core import email as email_utils
from models.sql_models import User, UserRole, Appointment, Prescription
from models.mongo_models import ClinicalNote
from schemas import user as user_schemas

router = APIRouter()

@router.get("/pending-doctors", response_model=List[user_schemas.User])
async def get_pending_doctors(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    List all doctors awaiting approval.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can access this endpoint")
        
    result = await db.execute(
        select(User).where(User.role == UserRole.DOCTOR, User.is_approved == False, User.is_active == True)
    )
    return result.scalars().all()

@router.post("/approve-doctor/{doctor_id}")
async def approve_doctor(
    doctor_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Approve a doctor and send confirmation email.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can approve doctors")
        
    result = await db.execute(select(User).where(User.id == doctor_id, User.role == UserRole.DOCTOR))
    doctor = result.scalars().first()
    
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    doctor.is_approved = True
    db.add(doctor)
    await db.commit()
    
    # Send Approval Email
    await email_utils.send_approval_email(doctor.email, doctor.full_name, background_tasks)
    
    return {"status": "success", "message": f"Doctor {doctor.full_name} approved successfully"}

@router.post("/reject-doctor/{doctor_id}")
async def reject_doctor(
    doctor_id: int,
    background_tasks: BackgroundTasks,
    reason: str = Body(..., embed=True),
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Reject a doctor registration and send rejection email.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can reject doctors")
        
    result = await db.execute(select(User).where(User.id == doctor_id, User.role == UserRole.DOCTOR))
    doctor = result.scalars().first()
    
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    doctor.is_approved = False
    doctor.is_active = False # Deactivate to remove from pending queue
    db.add(doctor)
    await db.commit()
    
    # Send Rejection Email
    await email_utils.send_rejection_email(doctor.email, doctor.full_name, reason, background_tasks)
    
    return {"status": "success", "message": f"Doctor {doctor.full_name} rejected successfully"}

@router.post("/restrict-doctor/{doctor_id}")
async def restrict_doctor(
    doctor_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Restrict/Deactivate a doctor.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can restrict doctors")
        
    result = await db.execute(select(User).where(User.id == doctor_id, User.role == UserRole.DOCTOR))
    doctor = result.scalars().first()
    
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    doctor.is_approved = False
    doctor.is_active = False # Also deactivate login
    db.add(doctor)
    await db.commit()
    
    return {"status": "success", "message": f"Doctor {doctor.full_name} restricted successfully"}

@router.get("/stats")
async def get_admin_stats(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Get dashboard stats for admin.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can access stats")
        
    # Count total appointments
    apt_count_result = await db.execute(select(func.count(Appointment.id)))
    total_appointments = apt_count_result.scalar()
    
    # Count pending approvals
    pending_count_result = await db.execute(
        select(func.count(User.id)).where(User.role == UserRole.DOCTOR, User.is_approved == False, User.is_active == True)
    )
    pending_approvals = pending_count_result.scalar()
    
    # Recent appointments with doctor and patient info
    from sqlalchemy.orm import aliased
    Doctor = aliased(User)
    Patient = aliased(User)
    recent_query = select(Appointment, Doctor.full_name.label("doctor_name"), Doctor.rahi_id.label("doctor_rahi_id"), Patient.rahi_id.label("patient_rahi_id")).outerjoin(
        Doctor, Appointment.doctor_id == Doctor.id
    ).outerjoin(
        Patient, Appointment.patient_id == Patient.id
    ).order_by(Appointment.id.desc()).limit(10)
    
    recent_apts_result = await db.execute(recent_query)
    recent_rows = recent_apts_result.all()
    
    # Get total doctor count
    doc_count_result = await db.execute(select(func.count(User.id)).where(User.role == UserRole.DOCTOR))
    total_doctors = doc_count_result.scalar()
    
    return {
        "total_appointments": total_appointments,
        "pending_approvals": pending_approvals,
        "total_doctors": total_doctors,
        "recent_appointments": [
            {
                "id": a.id,
                "patient_name": a.patient_name,
                "patient_rahi_id": patient_rahi_id,
                "doctor_name": doctor_name or "Unassigned",
                "doctor_rahi_id": doctor_rahi_id,
                "time": a.time,
                "status": a.status
            }
            for a, doctor_name, doctor_rahi_id, patient_rahi_id in recent_rows
        ]
    }

@router.get("/patients", response_model=List[user_schemas.User])
async def get_all_patients(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Forbidden")
    result = await db.execute(select(User).where(User.role == UserRole.PATIENT))
    return result.scalars().all()

@router.get("/doctors", response_model=List[user_schemas.User])
async def get_all_doctors(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Forbidden")
    result = await db.execute(select(User).where(User.role == UserRole.DOCTOR))
    return result.scalars().all()

@router.get("/patient-summary/{patient_id}")
async def get_patient_summary(
    patient_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    patient = await db.get(User, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    # Get clinical notes from Mongo
    notes = await ClinicalNote.find({"patient_id": patient_id}).sort("-created_at").to_list()
    
    # Get prescriptions from SQL
    pres_result = await db.execute(
        select(Prescription).where(Prescription.patient_id == patient_id).order_by(Prescription.created_at.desc())
    )
    prescriptions = pres_result.scalars().all()
    
    from fastapi.encoders import jsonable_encoder
    return jsonable_encoder({
        "profile": patient,
        "medical_history": {
            "notes": [
                {
                    "content": n.content,
                    "tags": n.tags,
                    "created_at": n.created_at,
                    "doctor_id": n.doctor_id
                } for n in notes
            ],
            "prescriptions": prescriptions
        }
    })

@router.get("/doctor-summary/{doctor_id}")
async def get_doctor_summary(
    doctor_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    result = await db.execute(select(User).where(User.id == doctor_id))
    doctor = result.scalars().first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    # Total consultations (Completed)
    count_res = await db.execute(
        select(func.count(Appointment.id)).where(
            Appointment.doctor_id == doctor_id,
            Appointment.status == "Completed"
        )
    )
    total_consultations = count_res.scalar()
    
    # Consultation History
    history_res = await db.execute(
        select(Appointment).where(Appointment.doctor_id == doctor_id).order_by(Appointment.id.desc())
    )
    history = history_res.scalars().all()
    
    from fastapi.encoders import jsonable_encoder
    return jsonable_encoder({
        "profile": doctor,
        "total_consultations": total_consultations,
        "consultation_history": history
    })

@router.post("/toggle-user-status/{user_id}")
async def toggle_user_status(
    user_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Lock or unlock a user account (Patient or Doctor).
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can toggle user status")
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_active = not user.is_active
    db.add(user)
    await db.commit()
    
    return {"status": "success", "is_active": user.is_active}
