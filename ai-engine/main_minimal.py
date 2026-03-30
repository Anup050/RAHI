from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "Minimal AI Engine Operational"}

@app.post("/predict")
def predict():
    return {"message": "Minimal endpoint working"}
