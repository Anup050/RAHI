import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_notifications():
    # 1. Login
    print("Logging in...")
    login_data = {
        "username": "doctor_test@example.com",
        "password": "password123"
    }
    res = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        return
    
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful!")

    # 2. Book an appointment
    print("Booking appointment...")
    payload = {
        "patient_name": "Notification Test Patient",
        "time": "Tomorrow at 10 AM",
        "type": "Follow-up",
        "reason": "Testing the notification system"
    }
    res = requests.post(f"{BASE_URL}/appointments", json=payload, headers=headers)
    if res.status_code != 200:
        print(f"Booking failed: {res.text}")
        return
    
    print("Appointment booked!")

    # 3. Check notifications
    print("Fetching notifications...")
    res = requests.get(f"{BASE_URL}/notifications", headers=headers)
    if res.status_code != 200:
        print(f"Fetch notifications failed: {res.text}")
        return
    
    notifications = res.json()
    print(f"Found {len(notifications)} notifications.")
    for n in notifications:
        print(f"- {n['title']}: {n['message']} (Read: {n['is_read']})")

if __name__ == "__main__":
    test_notifications()
