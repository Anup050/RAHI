import httpx
import asyncio
import sys

async def verify():
    with open("verify_output.txt", "w") as f:
        f.write("Verifying AI Engine at http://127.0.0.1:8002/ ...\n")
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                # Check Root
                resp = await client.get("http://127.0.0.1:8002/")
                f.write(f"Root Status: {resp.status_code}\n")
                f.write(f"Root Response: {resp.json()}\n")

                # Check Predict
                payload = {"text": "I have fever and headache", "symptoms": "fever"}
                f.write(f"\nTesting /predict with {payload}...\n")
                resp_pred = await client.post("http://127.0.0.1:8002/predict", json=payload)
                f.write(f"Predict Status: {resp_pred.status_code}\n")
                f.write(f"Predict Response: {resp_pred.json()}\n")
                
                if resp.status_code == 200 and resp_pred.status_code == 200:
                    f.write("\n[SUCCESS] AI Engine is fully operational!\n")
                else:
                    f.write("\n[FAILURE] AI Engine returned unexpected status codes.\n")

        except httpx.ConnectError:
            f.write("\n[FAILURE] Could not connect to AI Engine (Connection Refused). Is it running on port 8002?\n")
        except Exception as e:
            f.write(f"\n[ERROR] {e}\n")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(verify())
