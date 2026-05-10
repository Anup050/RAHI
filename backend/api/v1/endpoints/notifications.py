from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, desc
from datetime import datetime

from api import deps
from models.sql_models import Notification, NotificationRead, User

router = APIRouter()

@router.get("", response_model=List[Any])
async def read_notifications(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(deps.get_current_approved_user),
) -> Any:
    """
    Retrieve notifications for the current user (doctor/admin).
    """
    from sqlalchemy import outerjoin, case, literal_column
    
    user_role = current_user.role or "patient"
    
    # Base query for notifications visible to the user
    if user_role == "admin":
        # Admins see global admin alerts + their own
        from sqlalchemy import or_
        global_filter = (Notification.user_id == None) & (Notification.target_role == "admin")
        base_filter = or_(Notification.user_id == current_user.id, global_filter)
    elif user_role == "doctor":
        # Doctors see ONLY their own notifications OR specifically targeted doctor alerts
        from sqlalchemy import or_
        global_filter = (Notification.user_id == None) & (Notification.target_role == "doctor")
        base_filter = or_(Notification.user_id == current_user.id, global_filter)
    else:
        # Patients see only their own
        base_filter = (Notification.user_id == current_user.id)

    # Join with NotificationRead to get status for THIS user
    query = (
        select(
            Notification.id,
            Notification.title,
            Notification.message,
            Notification.type,
            Notification.created_at,
            # If a record exists in notification_reads for this user, it's read
            case(
                (NotificationRead.notification_id.isnot(None), True),
                else_=False
            ).label("is_read_status")
        )
        .outerjoin(
            NotificationRead, 
            (NotificationRead.notification_id == Notification.id) & (NotificationRead.user_id == current_user.id)
        )
        .where(base_filter)
        .order_by(desc(Notification.created_at))
        .offset(skip)
        .limit(limit)
    )
    
    result = await db.execute(query)
    notifications = result.all()
    
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read_status,
            "created_at": n.created_at.strftime("%Y-%m-%dT%H:%M:%SZ") if n.created_at else None
        }
        for n in notifications
    ]

@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_approved_user),
) -> Any:
    """
    Mark a notification as read for the current user.
    """
    # Check if already read to avoid unique constraint violation
    existing = await db.execute(
        select(NotificationRead).where(
            (NotificationRead.user_id == current_user.id) & 
            (NotificationRead.notification_id == notification_id)
        )
    )
    if existing.scalars().first():
        return {"status": "success", "detail": "Already read"}

    # Add read record
    read_entry = NotificationRead(
        user_id=current_user.id,
        notification_id=notification_id,
        read_at=None # Default will be handled or set manually
    )
    from datetime import datetime
    read_entry.read_at = datetime.utcnow()
    
    db.add(read_entry)
    await db.commit()
    
    return {"status": "success"}

@router.post("/read-all")
async def mark_all_notifications_read(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_approved_user),
) -> Any:
    """
    Mark all visible notifications as read for the current user.
    """
    from sqlalchemy import or_
    from datetime import datetime
    
    # 1. Get all notification IDs visible to the user
    if current_user.role == "admin":
        global_filter = (Notification.user_id == None) & (Notification.target_role == "admin")
        visible_filter = or_(Notification.user_id == current_user.id, global_filter)
    elif current_user.role == "doctor":
        global_filter = (Notification.user_id == None) & (Notification.target_role == "doctor")
        visible_filter = or_(Notification.user_id == current_user.id, global_filter)
    else:
        visible_filter = (Notification.user_id == current_user.id)
        
    # 2. Get IDs that are NOT already read by this user
    unread_query = (
        select(Notification.id)
        .where(visible_filter)
        .outerjoin(
            NotificationRead,
            (NotificationRead.notification_id == Notification.id) & (NotificationRead.user_id == current_user.id)
        )
        .where(NotificationRead.notification_id == None)
    )
    
    result = await db.execute(unread_query)
    unread_ids = [row[0] for row in result.all()]
    
    if not unread_ids:
        return {"status": "success", "detail": "No unread notifications"}
        
    # 3. Insert read records for all unread IDs
    now = datetime.utcnow()
    for nid in unread_ids:
        db.add(NotificationRead(user_id=current_user.id, notification_id=nid, read_at=now))
        
    await db.commit()
    
    return {"status": "success", "count": len(unread_ids)}
