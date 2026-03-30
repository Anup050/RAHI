from fastapi.testclient import TestClient
from main import app
import os
import pickle

client = TestClient(app)

def test_model_file_exists():
    # Ensure train.py ran
    assert os.path.exists("symptom_model.pkl")

def test_predict_endpoint():
    # Mock prediction
    response = client.post(
        "/predict",
        json={"symptoms": "fever headache"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "predictions" in data
    assert len(data["predictions"]) > 0
