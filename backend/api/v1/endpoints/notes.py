from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from api.deps import get_current_user, get_db
from models.sql_models import User
from models.mongo_models import ClinicalNote
from schemas.note import NoteCreate, NoteOut

router = APIRouter()

@router.post("/{patient_id}", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
async def create_note(
    patient_id: int,
    note_in: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["doctor", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        
    # Check if patient exists
    patient = await db.get(User, patient_id)
    if not patient or patient.role != "patient":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    new_note = ClinicalNote(
        patient_id=patient_id,
        doctor_id=current_user.id,
        content=note_in.content,
        tags=note_in.tags,
        created_at=datetime.utcnow()
    )
    await new_note.insert()
    
    # Beanie IDs are ObjectIds, convert to str for response
    return NoteOut(
        id=str(new_note.id),
        patient_id=new_note.patient_id,
        doctor_id=new_note.doctor_id,
        content=new_note.content,
        tags=new_note.tags,
        created_at=new_note.created_at
    )

@router.get("/{patient_id}", response_model=List[NoteOut])
async def get_patient_notes(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["doctor", "admin"] and current_user.id != patient_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        
    notes = await ClinicalNote.find({"patient_id": patient_id}).sort("-created_at").to_list()
    
    return [
        NoteOut(
            id=str(note.id),
            patient_id=note.patient_id,
            doctor_id=note.doctor_id,
            content=note.content,
            tags=note.tags,
            created_at=note.created_at
        )
        for note in notes
    ]
