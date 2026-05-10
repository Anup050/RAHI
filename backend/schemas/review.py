from pydantic import BaseModel
from typing import Optional, List
import datetime

class ReviewResponse(BaseModel):
    id: int
    rating: int
    comment: Optional[str] = None
    patient_name: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True
