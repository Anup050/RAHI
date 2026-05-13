from fastapi import FastAPI
from core.config import settings
import asyncio
import logging
import httpx

logger = logging.getLogger("rahi-backend")

app = FastAPI(title="RAHI Backend", version="0.1.0")
 
from fastapi.staticfiles import StaticFiles
import os
 
# Ensure static directory exists
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Security Middleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8081", # Expo Web
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

from api.v1.api import api_router
from db.session import init_mongo
from jobs.scheduler import start_scheduler

app.include_router(api_router, prefix=settings.API_V1_STR)


# ── AI Engine Wake-Up & Keep-Alive ──────────────────────────────────
async def wake_ai_engine():
    """Ping the AI Engine with retries until it wakes from Render cold sleep."""
    ai_url = settings.AI_ENGINE_URL.rstrip("/")
    health_url = f"{ai_url}/health"
    max_retries = 8
    delay = 15  # seconds between retries

    logger.info(f"Waking AI Engine at {health_url} (up to {max_retries} attempts) ...")
    async with httpx.AsyncClient(timeout=60.0) as client:
        for attempt in range(1, max_retries + 1):
            try:
                resp = await client.get(health_url)
                if resp.status_code == 200:
                    logger.info(f"AI Engine is LIVE (attempt {attempt}): {resp.json()}")
                    return  # Success — exit early
                else:
                    logger.warning(f"AI Engine returned {resp.status_code} (attempt {attempt}), retrying in {delay}s ...")
            except Exception as e:
                logger.warning(f"AI Engine ping failed (attempt {attempt}): {e}")

            if attempt < max_retries:
                await asyncio.sleep(delay)

    logger.error("AI Engine did not wake up after all retries. Predictions may fail until it starts.")


async def keep_ai_engine_alive():
    """Background loop: ping the AI Engine every 5 minutes to prevent Render sleep."""
    ai_url = settings.AI_ENGINE_URL.rstrip("/")
    health_url = f"{ai_url}/health"
    while True:
        await asyncio.sleep(300)  # 5 minutes
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.get(health_url)
                logger.debug(f"AI Engine keep-alive: {resp.status_code}")
        except Exception as e:
            logger.warning(f"AI Engine keep-alive ping failed: {e}")
# ────────────────────────────────────────────────────────────────────


@app.on_event("startup")
async def startup_event():
    await init_mongo()
    start_scheduler()

    # Wake AI Engine (background — doesn't block backend from going live)
    asyncio.create_task(wake_ai_engine())
    asyncio.create_task(keep_ai_engine_alive())


@app.get("/")
def read_root():
    return {"message": "Welcome to RAHI API", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
