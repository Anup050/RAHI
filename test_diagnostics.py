import urllib.request
import json
import time
import sys

def log(message):
    print(message)
    with open("diagnostics_final.txt", "a", encoding='utf-8') as f:
        f.write(message + "\n")

def test_ai_engine():
    log("\n--- Testing AI Engine Direct (Port 8002) ---")
    url = "http://localhost:8002/predict"
    # Dual payload to satisfy either contract
    payload = {"text": "I have high fever and cough", "symptoms": "I have high fever and cough"}
    try:
        req = urllib.request.Request(url)
        req.add_header('Content-Type', 'application/json; charset=utf-8')
        jsondata = json.dumps(payload).encode('utf-8')
        req.add_header('Content-Length', len(jsondata))
        
        log(f"Sending: {payload}")
        with urllib.request.urlopen(req, jsondata, timeout=5) as response:
            log(f"Status: {response.getcode()}")
            data = response.read()
            log(f"Response: {data.decode('utf-8')}")
    except Exception as e:
        log(f"FAILED to connect to AI Engine: {e}")

def test_backend_relay():
    log("\n--- Testing Backend Relay (Port 8000) ---")
    url = "http://127.0.0.1:8000/api/v1/symptoms/predict"
    payload = {"symptoms": "I have high fever and cough"} 
    try:
        req = urllib.request.Request(url)
        req.add_header('Content-Type', 'application/json; charset=utf-8')
        jsondata = json.dumps(payload).encode('utf-8')
        req.add_header('Content-Length', len(jsondata))
        
        log(f"Sending: {payload}")
        with urllib.request.urlopen(req, jsondata, timeout=5) as response:
            log(f"Status: {response.getcode()}")
            data = response.read()
            log(f"Response: {data.decode('utf-8')}")
    except Exception as e:
        log(f"FAILED to connect to Backend: {e}")

if __name__ == "__main__":
    # Clear previous log
    with open("direct_output.txt", "w") as f:
        f.write("Starting Diagnostics...\n")
    test_ai_engine()
    test_backend_relay()
