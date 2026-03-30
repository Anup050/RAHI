import httpx
from typing import List, Dict, Any, Optional
from fastapi import HTTPException

AI_ENGINE_URL = "http://127.0.0.1:8002"

async def get_ai_prediction(symptoms: str) -> Dict[str, Any]:
    """
    Sends symptoms to the AI Engine and returns predictions.
    Fallback: Returns a default message if AI service is unreachable.
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Send both 'text' and 'symptoms' to be robust against AI Engine version mismatches
            response = await client.post(
                f"{AI_ENGINE_URL}/predict",
                json={"symptoms": symptoms, "text": symptoms}
            )
            response.raise_for_status()
            data = response.json()
            print(f"DEBUG: AI Engine Response: {data}")
            return data
            
    except httpx.RequestError as exc:
        # Log error here (print for now)
        print(f"An error occurred while requesting {exc.request.url!r}.")
        return {
            "predictions": [],
            "message": "AI Service unreachable. Please consult a doctor directly.",
            "error": str(exc)
        }
    except httpx.HTTPStatusError as exc:
        print(f"Error response {exc.response.status_code} while requesting {exc.request.url!r}.")
        return {
             "predictions": [],
             "message": "AI Service error.",
             "error": str(exc)
        }
    except Exception as e:
        print(f"Unexpected error: {e}")
        return {
            "predictions": [],
            "message": "Internal error.",
            "error": str(e)
        }
