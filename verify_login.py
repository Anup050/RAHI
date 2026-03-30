import requests
import sys

BASE_URL = "http://localhost:8000/api/v1"
EMAIL = "testuser@example.com"
PASSWORD = "testpass123"

def verify_login():
    print(f"Attempting login for {EMAIL}...")
    try:
        # 1. Login
        login_data = {
            "username": EMAIL,
            "password": PASSWORD
        }
        res = requests.post(f"{BASE_URL}/auth/login", data=login_data)
        
        if res.status_code != 200:
            print(f"❌ Login failed: {res.status_code} - {res.text}")
            return False
            
        token_data = res.json()
        access_token = token_data.get("access_token")
        if not access_token:
            print("❌ No access token received.")
            return False
            
        print("✅ Login successful! Token received.")
        
        # 2. Access Protected Endpoint
        headers = {"Authorization": f"Bearer {access_token}"}
        print("Accessing protected appointments endpoint...")
        
        res = requests.get(f"{BASE_URL}/appointments/", headers=headers)
        
        if res.status_code == 200:
            print("✅ Successfully accessed appointments!")
            print(f"Data: {res.json()}")
            return True
        else:
            print(f"❌ Failed to access appointments: {res.status_code} - {res.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    if verify_login():
        sys.exit(0)
    else:
        sys.exit(1)
