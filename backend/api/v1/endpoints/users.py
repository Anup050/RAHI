from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from api import deps
from core import security
from models.sql_models import User
from schemas import user as user_schemas

router = APIRouter()

@router.get("/me", response_model=user_schemas.User)
async def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

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
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    if user_in.phone_number is not None:
        current_user.phone_number = user_in.phone_number
    if user_in.email is not None:
        current_user.email = user_in.email
    if user_in.age is not None:
        current_user.age = user_in.age
    
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
