import httpx
import asyncio

async def test_ai_engine():
    url = "https://rahi-ai-engine.onrender.com/health"
    print(f"Testing AI Engine Health at: {url}")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
            print(f"Status Code: {resp.status_code}")
            print(f"Response: {resp.json()}")
            
            if resp.status_code == 200:
                data = resp.json()
                if data.get("model_loaded"):
                    print("AI Engine is FULLY ready.")
                elif data.get("is_loading"):
                    print("AI Engine is UP, but still loading the model in background.")
                else:
                    print("AI Engine is UP, but model load hasn't started.")
            else:
                print(f"AI Engine returned error: {resp.status_code}")
                
    except Exception as e:
        print(f"Failed to connect to AI Engine: {e}")

if __name__ == "__main__":
    asyncio.run(test_ai_engine())
