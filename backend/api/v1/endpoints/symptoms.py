from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel

from services.ai_service import get_ai_prediction

router = APIRouter()

class SymptomRequest(BaseModel):
    symptoms: str

@router.post("/predict", response_model=Any)
async def predict_symptoms(
    request: SymptomRequest
) -> Any:
    """
    Get AI prediction for symptoms.
    """
    return await get_ai_prediction(request.symptoms)
