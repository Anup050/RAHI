import requests
import json

BASE_URL = "http://localhost:8000/api/v1/auth"

def test_email_login():
    email = "test_user_rahi@yopmail.com" # Disposable email for testing log availability
    
    print(f"1. Requesting OTP for {email}...")
    try:
        response = requests.post(
            f"{BASE_URL}/login-request",
            json={"email": email}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ OTP Request successful! Check backend logs/email.")
        else:
            print("❌ OTP Request failed.")
            
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("Ensure backend is running (localhost:8000)")

if __name__ == "__main__":
    test_email_login()
