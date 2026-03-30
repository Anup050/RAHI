import httpx
import asyncio

async def test_prediction():
    url = "http://127.0.0.1:8002/predict"
    payload = {
        "text": "I have a severe headache and fever."
    }
    
    print(f"Testing {url} with payload: {payload}")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=5.0)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
            
            if response.status_code == 200:
                print("SUCCESS: AI Engine is working!")
            else:
                print("FAILURE: AI Engine returned an error.")
    except Exception as e:
        print(f"ERROR: Could not connect to AI Engine. Is it running? {e}")

if __name__ == "__main__":
    asyncio.run(test_prediction())
