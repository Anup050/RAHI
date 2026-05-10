from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class NoteCreate(BaseModel):
    content: str
    tags: List[str] = []

class NoteOut(BaseModel):
    id: str
    patient_id: int
    doctor_id: int
    content: str
    tags: List[str]
    created_at: datetime

    class Config:
        orm_mode = True
