import requests
import json

URL = "http://localhost:8000/api/v1/appointments/"

payload = {
    "patient_name": "Test Script User",
    "time": "Today",
    "type": "Video Consult",
    "reason": "Script Verification"
}

try:
    print(f"Sending POST to {URL}...")
    res = requests.post(URL, json=payload)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")
    if res.status_code == 200:
        print("SUCCESS: Backend is accepting appointments.")
    else:
        print("FAILURE: Backend returned error.")
except Exception as e:
    print(f"ERROR: Could not connect to backend. {e}")
