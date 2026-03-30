import httpx
import asyncio
import sys

async def test():
    output = []
    try:
        output.append("Testing connection to http://127.0.0.1:8002/ ...")
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get("http://127.0.0.1:8002/")
            output.append(f"Status: {resp.status_code}")
            output.append(f"Response: {resp.json()}")
            
            # Test predict as well
            resp_pred = await client.post("http://127.0.0.1:8002/predict", json={"symptoms": "fever", "text": "fever"})
            output.append(f"Predict Status: {resp_pred.status_code}")
            output.append(f"Predict Response: {resp_pred.json()}")

    except Exception as e:
        output.append(f"Error: {e}")
    
    with open("connection_result_2.txt", "w") as f:
        f.write("\n".join(output))

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(test())

