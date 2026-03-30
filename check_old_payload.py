import urllib.request
import json

def check():
    url = "http://localhost:8001/predict"
    # Old payload format
    payload = {"text": "I have high fever"}
    print(f"Testing OLD payload: {payload}")
    
    try:
        req = urllib.request.Request(url)
        req.add_header('Content-Type', 'application/json')
        jsondata = json.dumps(payload).encode('utf-8')
        req.add_header('Content-Length', len(jsondata))
        
        with urllib.request.urlopen(req, jsondata, timeout=2) as r:
            print(f"Success! Status: {r.getcode()}")
            print(r.read().decode('utf-8'))
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    check()
