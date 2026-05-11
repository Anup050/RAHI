import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os
import re

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("rahi-ai")

# Global variables
model = None
symptoms_list = None
symptom_index_map = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for model loading and cleanup."""
    global model, symptoms_list, symptom_index_map
    logger.info("Starting up RAHI AI Engine...")
    
    try:
        # Load artifacts from current directory
        if os.path.exists("model_final.pkl"):
            model = joblib.load("model_final.pkl")
            logger.info("Model loaded successfully")
        else:
            logger.warning("model_final.pkl not found")

        if os.path.exists("symptoms_list.pkl"):
            symptoms_list = joblib.load("symptoms_list.pkl")
            # Create a quick lookup map (e.g., "itching" -> 0)
            symptom_index_map = {symptom.lower(): i for i, symptom in enumerate(symptoms_list)}
            logger.info(f"Loaded {len(symptoms_list)} symptoms")
        else:
            logger.warning("symptoms_list.pkl not found")
            
    except Exception as e:
        logger.error(f"Critical error loading model artifacts: {e}")
    
    yield
    logger.info("Shutting down RAHI AI Engine...")

app = FastAPI(
    title="RAHI AI Engine", 
    version="1.0.2",
    lifespan=lifespan
)

class SymptomRequest(BaseModel):
    text: str | None = None # User says: "I have itching and skin rash"
    symptoms: str | None = None # Backward compatibility

@app.post("/predict")
def predict(request: SymptomRequest):
    if model is None or symptoms_list is None:
        logger.error("Prediction attempt while model/symptoms not loaded")
        raise HTTPException(status_code=503, detail="AI Model not initialized. Please check server logs.")

    # 1. Robustly extract user text from Pydantic model
    # Support both Pydantic v1 (dict()) and v2 (model_dump())
    try:
        req_data = request.model_dump() if hasattr(request, "model_dump") else request.dict()
        user_text = req_data.get("text") or req_data.get("symptoms") or ""
    except Exception as e:
        logger.error(f"Error parsing request data: {e}")
        user_text = ""
    
    if not user_text:
        logger.warning("Empty prediction request received")
        raise HTTPException(status_code=422, detail="No symptoms provided in 'text' or 'symptoms' field.")

    # 2. Parse User Input (with Synonyms)
    try:
        input_vector = np.zeros(len(symptoms_list))
        user_text_norm = user_text.lower().replace("_", " ").strip()
        
        # Synonyms mapping
        synonyms = {
            "fever": "high_fever",
            "headache": "headache",
            "cough": "cough",
            "flu": "high_fever",
            "cold": "continuous_sneezing",
            "rash": "skin_rash",
            "itching": "itching",
            "stomach pain": "stomach_pain",
            "vomiting": "vomiting",
            "chest pain": "chest_pain"
        }

        # Normalize user text with formal terms
        working_text = user_text_norm
        for common, formal in synonyms.items():
            if common in user_text_norm:
                formal_clean = formal.replace("_", " ")
                if formal in symptom_index_map:
                    working_text += f" {formal_clean}"

        found_symptoms = []
        for symptom_col_name in symptoms_list:
            clean_symptom = symptom_col_name.replace("_", " ")
            if clean_symptom in working_text:
                index = symptom_index_map[symptom_col_name]
                input_vector[index] = 1
                found_symptoms.append(clean_symptom)

        if not found_symptoms:
            logger.info(f"No symptoms detected for input: '{user_text[:50]}...'")
            return {
                "predictions": [],
                "message": "Could not detect known symptoms. Try 'fever', 'headache', 'rash'.",
                "debug_found": [],
                "debug_user_text": user_text_norm
            }

        # 3. Predict with Feature Names to Silence Warnings
        # We wrap the vector in a DataFrame with the original column names
        input_df = pd.DataFrame([input_vector], columns=symptoms_list)
        
        prediction = model.predict(input_df)[0]
        probs = model.predict_proba(input_df)[0]
        max_prob = max(probs)

        logger.info(f"Prediction made: {prediction} ({max_prob:.2f}) for symptoms: {found_symptoms}")

        return {
            "predictions": [
                {
                    "disease": str(prediction),
                    "confidence": float(max_prob)
                }
            ],
            "debug_found": found_symptoms
        }

    except Exception as e:
        logger.error(f"Error during prediction logic: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal AI Engine error during processing.")

@app.get("/")
def health_check():
    return {
        "status": "RAHI AI Engine Operational",
        "model_loaded": model is not None,
        "version": "1.0.2"
    }
