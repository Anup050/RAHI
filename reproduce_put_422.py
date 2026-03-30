import requests
import json

def reproduce():
    base_url = "http://localhost:8000/api/v1"
    
    # 1. Login to get token
    login_data = {
        "username": "mobile_test@example.com",
        "password": "password123"
    }
    print(f"Attempting login for {login_data['username']}...")
    try:
        response = requests.post(f"{base_url}/auth/login", data=login_data)
        if response.status_code != 200:
            print(f"Login failed with status {response.status_code}: {response.text}")
            return
    except Exception as e:
        print(f"Error during login: {e}")
        return

    token = response.json().get("access_token")
    print("Login successful.")

    # 2. Attempt PUT /users/me without email (as the frontend does)
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "full_name": "Updated Test User",
        "phone_number": "+919876543210"
    }
    
    print(f"Sending PUT /users/me with payload: {payload}")
    response = requests.put(f"{base_url}/users/me", headers=headers, json=payload)
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 422:
        print("REPRODUCED: 422 Unprocessable Entity")
        print("Details:", json.dumps(response.json(), indent=2))
    elif response.status_code == 200:
        print("SUCCESS: 200 OK (Issue may already be fixed?)")
    else:
        print(f"UNEXPECTED Status: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    reproduce()
