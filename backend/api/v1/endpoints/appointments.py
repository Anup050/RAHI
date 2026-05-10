from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from datetime import datetime, timezone, timedelta
from fastapi import BackgroundTasks
from api import deps
from core import email as email_utils
from models.sql_models import Appointment, User, Notification, Review
from schemas import appointment as appointment_schemas

router = APIRouter()

@router.get("/availability/{doctor_id}")
async def get_availability(
    doctor_id: int,
    date: str, # Format: YYYY-MM-DD
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    """
    Get available time slots for a doctor on a specific date.
    """
    all_slots = [
        "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
    ]
    
    query = select(Appointment.time).where(
        Appointment.doctor_id == doctor_id,
        Appointment.time.like(f"{date}%"),
        Appointment.status != "Cancelled"
    )
    result = await db.execute(query)
    booked_times = result.scalars().all()
    
    def slot_to_time_part(slot: str):
        time, period = slot.split(' ')
        hours, minutes = time.split(':')
        h = int(hours)
        if period == 'PM' and h != 12: h += 12
        if period == 'AM' and h == 12: h = 0
        return f"{h:02d}:{minutes}:00"

    available_slots = []
    for slot in all_slots:
        time_part = slot_to_time_part(slot)
        is_booked = any(time_part in bt for bt in booked_times)
        if not is_booked:
            available_slots.append(slot)
            
    return available_slots

@router.get("", response_model=List[appointment_schemas.Appointment])

async def read_appointments(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_approved_user),
) -> Any:
    """
    Retrieve appointments.
    Patients see only their own appointments.
    Doctors see all appointments.
    """
    # Join with User table to get doctor name and patient rahi_id
    from sqlalchemy.orm import aliased
    Doctor = aliased(User)
    Patient = aliased(User)
    query = select(
        Appointment, 
        Doctor.full_name.label("doctor_name"), 
        Doctor.rahi_id.label("doctor_rahi_id"),
        Patient.rahi_id.label("patient_rahi_id")
    ).outerjoin(
        Doctor, Appointment.doctor_id == Doctor.id
    ).outerjoin(
        Patient, Appointment.patient_id == Patient.id
    )
    
    # Filter based on user role
    query = query.order_by(Appointment.id.desc())
    print(f"DEBUG: read_appointments for user_id={current_user.id}, role={current_user.role}")
    if current_user.role == "patient":
        query = query.where(Appointment.patient_id == current_user.id)
    elif current_user.role == "doctor":
        query = query.where(Appointment.doctor_id == current_user.id)
    elif current_user.role == "admin":
        print("DEBUG: Admin user, showing all appointments")
        pass # Admin sees everything
    else:
        # Fallback for other roles if any
        query = query.where(Appointment.patient_id == current_user.id)
    
    result = await db.execute(query.offset(skip).limit(limit))
    rows = result.all()
    print(f"DEBUG: read_appointments found {len(rows)} rows for user {current_user.id} ({current_user.role})")
    for row in rows:
        print(f"DEBUG: Found appointment ID {row.Appointment.id} with doctor_id {row.Appointment.doctor_id}")
    
    results = []
    for row in rows:
        a = row.Appointment
        d_name = row.doctor_name
        p_rahi_id = row.patient_rahi_id
        d_rahi_id = row.doctor_rahi_id
        results.append({
            "id": a.id,
            "patient_id": a.patient_id,
            "doctor_id": a.doctor_id,
            "doctor_name": d_name or "Unassigned",
            "doctor_rahi_id": d_rahi_id,
            "time": a.time,
            "status": a.status,
            "confirmed": a.confirmed,
            "patient": a.patient_name,
            "type": a.type,
            "reason": a.reason,
            "patient_name": a.patient_name,
            "patient_rahi_id": p_rahi_id,
            "has_review": a.has_review,
            "rating": a.rating
        })
    return results

@router.get("/patients")
async def get_doctor_patients(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_approved_user),
) -> Any:
    """
    Get unique patients who have appointments with this doctor.
    """
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can view patient list")
    
    # Select unique patients from ALL appointments
    # Since doctors can see all pending appointments, we show all patients who have ever booked.
    query = select(User).join(
        Appointment, User.id == Appointment.patient_id
    ).where(Appointment.doctor_id == current_user.id).distinct()
    
    result = await db.execute(query)
    patients = result.scalars().all()
    
    # Format to match frontend expectations, avoiding dummy data
    results = []
    for p in patients:
        # Get latest appointment for lastVisit
        latest_apt = await db.execute(
            select(Appointment.time)
            .where(Appointment.patient_id == p.id)
            .order_by(Appointment.time.desc())
            .limit(1)
        )
        latest_time = latest_apt.scalar()
        
        last_visit_str = "No record"
        if latest_time:
            try:
                # Assuming time string format like '2023-10-15T10:00:00Z'
                last_visit_str = latest_time.split('T')[0]
            except:
                last_visit_str = latest_time

        results.append({
            "id": str(p.id),
            "name": p.full_name or "Anonymous",
            "age": p.age if p.age and p.age > 0 else None,
            "gender": None,
            "phone": p.phone_number or "Not Provided",
            "lastVisit": last_visit_str,
            "status": "Active" if p.is_active else "Inactive",
            "condition": "Patient"
        })
    return results

@router.post("", response_model=appointment_schemas.Appointment)
async def create_appointment(
    *,
    db: AsyncSession = Depends(deps.get_db),
    appointment_in: appointment_schemas.AppointmentCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_approved_user),
) -> Any:
    """
    Create new appointment.
    """
    # Use the logged-in user's name if patient_name is not provided
    print(f"DEBUG: create_appointment payload: doctor_id={appointment_in.doctor_id}, patient_name={appointment_in.patient_name}, time={appointment_in.time}")
    resolved_name = appointment_in.patient_name or current_user.full_name or current_user.email
    
    # Availability Check
    if appointment_in.doctor_id:
        # Check if this exact slot is taken
        existing_apt = await db.execute(
            select(Appointment).where(
                Appointment.doctor_id == appointment_in.doctor_id,
                Appointment.time == appointment_in.time,
                Appointment.status != "Cancelled"
            )
        )
        if existing_apt.scalars().first():
            # Find the next available slot (simulated for MVP: 1 hour later)
            try:
                requested_time = datetime.fromisoformat(appointment_in.time.replace('Z', '+00:00'))
                suggested_time = requested_time + timedelta(hours=1)
                suggested_str = suggested_time.strftime("%Y-%m-%dT%H:%M:%SZ")
            except:
                suggested_str = "an hour later"
            
            raise HTTPException(
                status_code=409, 
                detail={
                    "message": "This slot is already booked. Please try to book a different slot, or book for tomorrow or another day.",
                    "suggested_slot": suggested_str
                }
            )

    print(f"DEBUG: create_appointment by user_id={current_user.id}, doctor_id={appointment_in.doctor_id}, time={appointment_in.time}")
    appointment = Appointment(
        patient_id=current_user.id,
        doctor_id=appointment_in.doctor_id,
        time=appointment_in.time,
        patient_name=resolved_name,
        type=appointment_in.type,
        reason=appointment_in.reason,
        status="Pending",
        confirmed=False
    )
    db.add(appointment)
    await db.commit()
    # Final Fetch with Joins
    from sqlalchemy.orm import aliased
    Doctor = aliased(User)
    Patient = aliased(User)
    query = select(
        Appointment, 
        Doctor.full_name.label("doctor_name"), 
        Doctor.rahi_id.label("doctor_rahi_id"),
        Patient.rahi_id.label("patient_rahi_id")
    ).outerjoin(
        Doctor, Appointment.doctor_id == Doctor.id
    ).outerjoin(
        Patient, Appointment.patient_id == Patient.id
    ).where(Appointment.id == appointment.id)
    
    final_result = await db.execute(query)
    row = final_result.first()
    
    if not row:
        return appointment

    # Fetch Doctor details if assigned
    doctor = None
    if appointment.doctor_id:
        doc_result = await db.execute(select(User).where(User.id == appointment.doctor_id))
        doctor = doc_result.scalars().first()
        if doctor:
            print(f"DEBUG: Appointment assigned to doctor: {doctor.full_name} (ID: {doctor.id})")
        else:
            print(f"DEBUG: Doctor with ID {appointment.doctor_id} not found!")

    # Notify Patient via Email
    await email_utils.send_appointment_confirmation(
        current_user.email,
        resolved_name,
        doctor.full_name if doctor else "Unassigned",
        appointment.time,
        appointment.type,
        background_tasks
    )

    # Notify Doctor via Email if preferences allow
    if doctor and doctor.notifications_enabled:
        await email_utils.send_appointment_notification(
            doctor.email, 
            doctor.full_name, 
            resolved_name, 
            appointment.time,
            appointment.reason,
            appointment.type, 
            background_tasks
        )
    
    # Create notification for the specific doctor (Personal)
    if appointment.doctor_id:
        doc_notif = Notification(
            user_id=appointment.doctor_id,
            target_role="doctor",
            title="New Appointment Request",
            message=f"Patient {resolved_name} booked for {appointment.reason} via {appointment.type}.",
            type="appointment",
            created_at=datetime.now(timezone.utc).replace(tzinfo=None)
        )
        db.add(doc_notif)
    
    # Create notification for Admin (Global)
    doctor_name = doctor.full_name if doctor else "Unassigned"
    admin_notif = Notification(
        user_id=None,
        target_role="admin",
        title="New Platform Appointment",
        message=f"Patient {resolved_name} booked for {appointment.reason} via {appointment.type} with Doctor {doctor_name}.",
        type="appointment",
        created_at=datetime.now(timezone.utc).replace(tzinfo=None)
    )
    db.add(admin_notif)
    
    # Notify Patient in App
    patient_notif = Notification(
        user_id=current_user.id,
        title="Appointment Booked",
        message=f"Your appointment for {appointment.reason} has been booked successfully.",
        type="appointment",
        created_at=datetime.now(timezone.utc).replace(tzinfo=None)
    )
    db.add(patient_notif)

    await db.commit()
    
    return {
            "id": appointment.id,
            "patient_id": appointment.patient_id,
            "doctor_id": appointment.doctor_id,
            "time": appointment.time,
            "status": appointment.status,
            "confirmed": appointment.confirmed,
            "patient": appointment.patient_name,
            "type": appointment.type,
            "reason": appointment.reason,
            "patient_name": appointment.patient_name
        }


# AppointmentUpdate is imported from schemas.appointment as appointment_schemas.AppointmentUpdate

class ReviewCreate(BaseModel):
    rating: int
    comment: str

@router.patch("/{appointment_id}", response_model=appointment_schemas.Appointment)
async def update_appointment(
    appointment_id: int,
    appointment_in: appointment_schemas.AppointmentUpdate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_approved_user),
) -> Any:
    """
    Update appointment status.
    """
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appointment = result.scalars().first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    old_status = appointment.status
    appointment.status = appointment_in.status
    if appointment_in.status == 'Confirmed':
        appointment.confirmed = True
        
    db.add(appointment)
    
    # Notify Patient/Doctor if status changed
    if old_status != appointment_in.status:
        # Fetch related users for notifications
        patient_res = await db.execute(select(User).where(User.id == appointment.patient_id))
        patient = patient_res.scalars().first()
        
        doctor_name = "Your Doctor"
        if appointment.doctor_id:
            doctor_res = await db.execute(select(User).where(User.id == appointment.doctor_id))
            doctor = doctor_res.scalars().first()
            if doctor:
                doctor_name = doctor.full_name

        from core.notifications import send_push_notification
        if appointment_in.status == 'Confirmed':
            # Push Notification
            if patient and patient.push_token:
                send_push_notification(
                    patient.push_token,
                    "Appointment Confirmed",
                    f"Your appointment for {appointment.reason} has been confirmed by {doctor_name}."
                )
            # App Notification
            notif = Notification(
                user_id=appointment.patient_id,
                title="Appointment Confirmed",
                message=f"Your appointment for {appointment.reason} has been confirmed by {doctor_name}.",
                type="appointment",
                created_at=datetime.now(timezone.utc).replace(tzinfo=None)
            )
            db.add(notif)
            
            # Email Notification
            if patient:
                await email_utils.send_appointment_confirmation(
                    patient.email,
                    patient.full_name or "Patient",
                    doctor_name,
                    appointment.time,
                    appointment.type,
                    background_tasks
                )

        elif appointment_in.status == 'In Progress':
            # App Notification for Start
            notif = Notification(
                user_id=appointment.patient_id,
                title="Consultation Started",
                message=f"Dr. {doctor_name} has started your consultation. Please join the call.",
                type="call",
                created_at=datetime.now(timezone.utc).replace(tzinfo=None)
            )
            db.add(notif)

        elif appointment_in.status == 'Declined':
            # Push Notification
            if patient and patient.push_token:
                send_push_notification(
                    patient.push_token,
                    "Appointment Declined",
                    f"Your appointment for {appointment.reason} has been declined by {doctor_name}."
                )
            # App Notification
            notif = Notification(
                user_id=appointment.patient_id,
                title="Appointment Declined",
                message=f"Your appointment for {appointment.reason} has been declined by {doctor_name}. Please try booking a different slot or doctor.",
                type="appointment",
                created_at=datetime.now(timezone.utc).replace(tzinfo=None)
            )
            db.add(notif)
            
            # Email Notification
            if patient:
                # We need a send_rejection_email function
                await email_utils.send_appointment_rejection(
                    patient.email,
                    patient.full_name or "Patient",
                    doctor_name,
                    appointment.time,
                    appointment_in.reason or "Schedule conflict",
                    background_tasks
                )

        elif appointment_in.status == 'Completed':
            # Push Notification
            if patient and patient.push_token:
                send_push_notification(
                    patient.push_token,
                    "Consultation Completed",
                    f"Your consultation for {appointment.reason} is done. Thank you for choosing RAHI Health!"
                )
            # App Notification
            notif = Notification(
                user_id=appointment.patient_id,
                title="Consultation Completed",
                message=f"Your consultation for {appointment.reason} is done. Thank you for choosing RAHI Health!",
                type="appointment",
                created_at=datetime.now(timezone.utc).replace(tzinfo=None)
            )
            db.add(notif)
            
            # Email Notification
            if patient:
                await email_utils.send_consultation_completion(
                    patient.email,
                    patient.full_name or "Patient",
                    doctor_name,
                    background_tasks
                )

    await db.commit()
    await db.refresh(appointment)
    
    return {
            "id": appointment.id,
            "patient_id": appointment.patient_id,
            "doctor_id": appointment.doctor_id,
            "time": appointment.time,
            "status": appointment.status,
            "confirmed": appointment.confirmed,
            "patient": appointment.patient_name,
            "type": appointment.type,
            "reason": appointment.reason,
            "patient_name": appointment.patient_name,
            "has_review": appointment.has_review,
            "rating": appointment.rating
        }

@router.post("/{appointment_id}/review")
async def create_review(
    appointment_id: int,
    review_in: ReviewCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_approved_user),
) -> Any:
    """
    Submit a review for a completed appointment.
    """
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appointment = result.scalars().first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only review your own appointments")
    
    if appointment.status != 'Completed':
        raise HTTPException(status_code=400, detail="Only completed appointments can be reviewed")
    
    if appointment.has_review:
        raise HTTPException(status_code=400, detail="Review already submitted")
    
    review = Review(
        appointment_id=appointment.id,
        patient_id=current_user.id,
        doctor_id=appointment.doctor_id,
        rating=review_in.rating,
        comment=review_in.comment,
        created_at=datetime.now(timezone.utc).replace(tzinfo=None)
    )
    
    appointment.has_review = True
    appointment.rating = review_in.rating
    
    db.add(review)
    db.add(appointment)
    await db.commit()
    
    # Recalculate average rating for doctor
    if appointment.doctor_id:
        from sqlalchemy import func
        review_query = select(
            func.avg(Review.rating).label("avg_rating"),
            func.count(Review.id).label("count")
        ).where(Review.doctor_id == appointment.doctor_id)
        
        review_result = await db.execute(review_query)
        stats = review_result.first()
        
        doctor_res = await db.execute(select(User).where(User.id == appointment.doctor_id))
        doctor = doctor_res.scalars().first()
        if doctor:
            doctor.avg_rating = round(float(stats.avg_rating or 0.0), 1)
            doctor.review_count = stats.count or 0
            db.add(doctor)
            await db.commit()
    
    return {"message": "Review submitted successfully"}
