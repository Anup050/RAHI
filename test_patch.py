import requests

URL = "http://localhost:8000/api/v1/appointments/"

# 1. Create Appointment
print("Creating Appointment...")
res = requests.post(URL, json={
    "patient_name": "Patch Test User",
    "time": "Now",
    "type": "Video",
    "reason": "Testing Patch"
})
if res.status_code != 200:
    print(f"Create Failed: {res.text}")
    exit()

apt_id = res.json()['id']
print(f"Created ID: {apt_id}")

# 2. Update Status (PATCH)
print(f"Updating Status for ID {apt_id}...")
res = requests.patch(f"{URL}{apt_id}", json={"status": "Confirmed"})
print(f"Status: {res.status_code}")
print(f"Response: {res.text}")

if res.status_code == 200 and res.json()['status'] == 'Confirmed':
    print("SUCCESS: Patch endpoint works.")
else:
    print("FAILURE: Patch endpoint failed.")
