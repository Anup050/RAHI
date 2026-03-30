from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os
import re

app = FastAPI(title="RAHI AI Engine", version="1.0.1")

# Global variables
model = None
symptoms_list = None
symptom_index_map = {}

class SymptomRequest(BaseModel):
    text: str | None = None # User says: "I have itching and skin rash"
    symptoms: str | None = None # Backward compatibility

@app.on_event("startup")
def load_artifacts():
    global model, symptoms_list, symptom_index_map
    try:
        # Load artifacts from current directory
        if os.path.exists("model_final.pkl"):
            model = joblib.load("model_final.pkl")
            print("[OK] Model loaded")
        else:
            print("[WARNING] model_final.pkl not found")

        if os.path.exists("symptoms_list.pkl"):
            symptoms_list = joblib.load("symptoms_list.pkl")
            # Create a quick lookup map (e.g., "itching" -> 0)
            symptom_index_map = {symptom.lower(): i for i, symptom in enumerate(symptoms_list)}
            print(f"[OK] Loaded {len(symptoms_list)} symptoms")
        else:
            print("[WARNING] symptoms_list.pkl not found")
        
    except Exception as e:
        print(f"[ERROR] Error loading model: {e}")

@app.post("/predict")
def predict(request: SymptomRequest):
    if not model or not symptoms_list:
        raise HTTPException(status_code=503, detail="Model not ready. Please run train_real.py first.")

    # Robustly get user text
    user_text = request.text
    if not user_text and request.symptoms:
        user_text = request.symptoms
    
    if not user_text:
        raise HTTPException(status_code=422, detail="No symptoms provided in 'text' or 'symptoms' field.")

    # 1. Parse User Input (with Synonyms)
    input_vector = np.zeros(len(symptoms_list))
    user_text = user_text.lower().replace("_", " ") # Normalize
    
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

    # Normalize user text
    for common, formal in synonyms.items():
        if common in user_text:
            # Check if the formal term is actually in our symptom list
            formal_clean = formal.replace("_", " ")
            if formal in symptom_index_map:
                # We essentially inject the formal term into the text to ensure matching
                user_text += f" {formal_clean}"

    found_symptoms = []
    
    for symptom_col_name in symptoms_list:
        clean_symptom = symptom_col_name.replace("_", " ")
        
        if clean_symptom in user_text:
            index = symptom_index_map[symptom_col_name]
            input_vector[index] = 1
            found_symptoms.append(clean_symptom)

    if not found_symptoms:
        return {
            "predictions": [],
            "message": "Could not detect known symptoms. Try 'fever', 'headache', 'rash'.",
            "debug_found": [],
            "debug_user_text": user_text,
            "debug_len_symptoms": len(symptoms_list)
        }

    # 2. Predict
    prediction = model.predict([input_vector])[0]
    probs = model.predict_proba([input_vector])[0]
    max_prob = max(probs)

    return {
        "predictions": [
            {
                "disease": prediction,
                "confidence": float(max_prob)
            }
        ],
        "debug_found": found_symptoms
    }

@app.get("/")
def health_check():
    return {
        "status": "RAHI AI Engine Operational",
        "model_loaded": model is not None
    }
