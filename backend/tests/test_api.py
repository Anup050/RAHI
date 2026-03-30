from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to RAHI API", "status": "running"}

def test_login_failure():
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "wrong@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401

# Note: For full integration tests, we need a test DB setup which overrides 'get_db'.
# For this MVP step, we are testing the basic connectivity and public endpoints.
