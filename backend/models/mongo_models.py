from typing import List, Optional
from datetime import datetime
from beanie import Document
from pydantic import Field

class ClinicalNote(Document):
    patient_id: int
    doctor_id: int
    content: str
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "clinical_notes"
