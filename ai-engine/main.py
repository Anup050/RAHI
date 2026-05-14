import logging
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import os

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
is_loading = False

async def load_model_artifacts():
    """Background task to load model artifacts without blocking startup."""
    global model, symptoms_list, symptom_index_map, is_loading
    if is_loading:
        return
    
    is_loading = True
    logger.info("📦 Loading RAHI AI Model artifacts in background...")
    try:
        # Import heavy libraries here to speed up main process startup
        import joblib
        
        # Give the system a moment to breathe before heavy unpickling
        await asyncio.sleep(1) 
        
        if os.path.exists("model_final.pkl"):
            model = joblib.load("model_final.pkl")
            logger.info("✅ Model loaded successfully")
        else:
            logger.error("❌ model_final.pkl not found")

        if os.path.exists("symptoms_list.pkl"):
            symptoms_list = joblib.load("symptoms_list.pkl")
            symptom_index_map = {symptom.lower(): i for i, symptom in enumerate(symptoms_list)}
            logger.info(f"✅ Loaded {len(symptoms_list)} symptoms")
        else:
            logger.error("❌ symptoms_list.pkl not found")
            
    except Exception as e:
        logger.error(f"❌ Critical error loading model artifacts: {e}")
    finally:
        is_loading = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager."""
    # Trigger loading immediately but don't await it
    asyncio.create_task(load_model_artifacts())
    yield
    logger.info("Shutting down RAHI AI Engine...")

app = FastAPI(
    title="RAHI AI Engine", 
    version="1.1.1",
    lifespan=lifespan
)

class SymptomRequest(BaseModel):
    text: str | None = None
    symptoms: str | None = None

@app.post("/predict")
async def predict(request: SymptomRequest):
    global model, symptoms_list
    
    if model is None or symptoms_list is None:
        if is_loading:
            raise HTTPException(status_code=503, detail="AI Model is still loading. Please try again in 10 seconds.")
        # If not loading and not loaded, try to trigger it one more time
        asyncio.create_task(load_model_artifacts())
        raise HTTPException(status_code=503, detail="AI Model not initialized. Retrying load...")

    try:
        import pandas as pd
        import numpy as np
        
        req_data = request.model_dump() if hasattr(request, "model_dump") else request.dict()
        user_text = req_data.get("text") or req_data.get("symptoms") or ""
        
        if not user_text:
            raise HTTPException(status_code=422, detail="No symptoms provided.")

        input_vector = np.zeros(len(symptoms_list))
        user_text_norm = user_text.lower().replace("_", " ").strip()
        
        synonyms = {
            "fever": "high_fever",
            "rash": "skin_rash",
            "cold": "continuous_sneezing",
            "flu": "high_fever",
            "stomach pain": "stomach_pain",
            "chest pain": "chest_pain"
        }

        working_text = user_text_norm
        for common, formal in synonyms.items():
            if common in user_text_norm:
                working_text += f" {formal.replace('_', ' ')}"

        found_symptoms = []
        for symptom_col_name in symptoms_list:
            clean_symptom = symptom_col_name.replace("_", " ")
            if clean_symptom in working_text:
                index = symptom_index_map[symptom_col_name.lower()]
                input_vector[index] = 1
                found_symptoms.append(clean_symptom)

        if not found_symptoms:
            return {"predictions": [], "message": "No known symptoms detected.", "debug_found": []}

        # Create DataFrame with exact column names and order
        input_df = pd.DataFrame([input_vector], columns=symptoms_list)
        
        prediction = model.predict(input_df)[0]
        probs = model.predict_proba(input_df)[0]
        max_prob = max(probs)

        return {
            "predictions": [{"disease": str(prediction), "confidence": float(max_prob)}],
            "debug_found": found_symptoms
        }

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail="Internal AI Engine error.")

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "RAHI AI Engine Operational",
        "model_loaded": model is not None,
        "is_loading": is_loading,
        "version": "1.1.1",
        "timestamp": pd.Timestamp.now().isoformat() if 'pd' in locals() else None
    }


