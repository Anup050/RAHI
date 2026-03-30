import urllib.request
import json

url = "http://127.0.0.1:8001/predict"
payload = {"text": "I have itching and skin rash"}
headers = {'Content-Type': 'application/json'}

try:
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers)
    with urllib.request.urlopen(req) as response:
        result = {
            "status_code": response.getcode(),
            "json": json.loads(response.read().decode('utf-8'))
        }
        with open("api_result.txt", "w") as f:
            f.write(json.dumps(result, indent=2))
        print("Success")
except Exception as e:
    with open("api_result.txt", "w") as f:
        f.write(f"Request failed: {e}")
    print(f"Request failed: {e}")
