from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from api import deps
from models.sql_models import Appointment, User, UserRole

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get dashboard stats for doctors.
    """
    from sqlalchemy import or_
    
    # Count total patients in the system
    patients_count_result = await db.execute(select(func.count(User.id)).where(User.role == UserRole.PATIENT))
    total_patients = patients_count_result.scalar()

    # Count today's appointments for THIS doctor
    appointments_count_result = await db.execute(
        select(func.count(Appointment.id)).where(Appointment.doctor_id == current_user.id)
    )
    appointments_count = appointments_count_result.scalar()

    # Count pending/unassigned requests
    pending_count_result = await db.execute(
        select(func.count(Appointment.id)).where(Appointment.status == "Pending")
    )
    pending_requests = pending_count_result.scalar()

    # Count confirmed appointments
    confirmed_count_result = await db.execute(
        select(func.count(Appointment.id)).where(Appointment.status == "Confirmed")
    )
    confirmed_requests = confirmed_count_result.scalar()

    # Count completed appointments
    completed_count_result = await db.execute(
        select(func.count(Appointment.id)).where(Appointment.status == "Completed")
    )
    completed_requests = completed_count_result.scalar()

    return {
        "appointments_count": appointments_count,
        "pending_requests": pending_requests,
        "confirmed_requests": confirmed_requests,
        "completed_requests": completed_requests,
        "total_patients": total_patients,
        "avg_wait_time": "12m"
    }
