from fastapi import FastAPI
from core.config import settings
import asyncio
import logging
import httpx

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("rahi-backend")

# ── Background task references (for cleanup) ──
_background_tasks: list[asyncio.Task] = []

from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles
import os

# Ensure static directory exists
os.makedirs("static/uploads", exist_ok=True)

from api.v1.api import api_router
from db.session import init_mongo
from jobs.scheduler import start_scheduler


# ── AI Engine Wake-Up & Keep-Alive ──────────────────────────────────
_ai_wake_in_progress = False

async def wake_ai_engine():
    """Ping the AI Engine with retries until it wakes from Render cold sleep."""
    global _ai_wake_in_progress
    if _ai_wake_in_progress:
        return
    
    _ai_wake_in_progress = True
    try:
        ai_url = settings.AI_ENGINE_URL.rstrip("/")
        health_url = f"{ai_url}/health"
        # Progressive delays: 5, 5, 10, 10, 15, 15, 20, 20, 30, 30, 30, 30...
        delays = [5, 5, 10, 10, 15, 15, 20, 20, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
        max_retries = len(delays)

        logger.info(f"⏳ Waking AI Engine at {health_url} (up to {max_retries} attempts) ...")
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            for attempt in range(1, max_retries + 1):
                try:
                    resp = await client.get(health_url)
                    if resp.status_code == 200:
                        data = resp.json()
                        if data.get("model_loaded") is True:
                            logger.info(f"✅ AI Engine is LIVE & Model Loaded (attempt {attempt})")
                            return True
                        else:
                            logger.info(f"⏳ AI Engine reachable but Model still loading (attempt {attempt}) ...")
                    elif resp.status_code in [502, 503, 504]:
                        logger.info(f"⏳ AI Engine gateway waking up ({resp.status_code}) (attempt {attempt}) ...")
                    else:
                        logger.warning(f"AI Engine returned status {resp.status_code} (attempt {attempt})")
                except Exception as e:
                    logger.info(f"⏳ AI Engine connection pending (attempt {attempt}): {type(e).__name__}")

                if attempt < max_retries:
                    delay = delays[attempt-1]
                    await asyncio.sleep(delay)

        logger.error("❌ AI Engine did not wake up after all retries.")
        return False
    finally:
        _ai_wake_in_progress = False


async def keep_ai_engine_alive():
    """Background loop: ping the AI Engine every 3 minutes to prevent Render sleep."""
    ai_url = settings.AI_ENGINE_URL.rstrip("/")
    health_url = f"{ai_url}/health"

    while True:
        await asyncio.sleep(180)  # 3 minutes
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.get(health_url)
                if resp.status_code == 200:
                    logger.debug(f"AI Engine keep-alive OK")
                else:
                    logger.warning(f"AI Engine keep-alive: status {resp.status_code}")
                    # If AI Engine is down, try to wake it up in background
                    asyncio.create_task(wake_ai_engine())
        except Exception as e:
            logger.warning(f"AI Engine keep-alive failed: {e} — triggering wake-up")
            asyncio.create_task(wake_ai_engine())


async def keep_backend_alive():
    """
    Self-ping using external URL to prevent Render from putting the BACKEND to sleep.
    """
    url = settings.BACKEND_URL.rstrip("/")
    if "localhost" in url or "0.0.0.0" in url:
        logger.info("Backend self-ping using local address (may not prevent Render sleep)")
    
    while True:
        await asyncio.sleep(240)  # 4 minutes
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url)
                logger.debug(f"Backend self-ping: {resp.status_code}")
        except Exception as e:
            logger.debug(f"Backend self-ping skipped: {e}")
# ────────────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle — startup and shutdown."""
    global _background_tasks

    # Startup
    await init_mongo()
    start_scheduler()

    # Pre-trigger AI Engine wake-up immediately
    logger.info("Initiating early AI Engine wake-up...")
    t1 = asyncio.create_task(wake_ai_engine())
    t2 = asyncio.create_task(keep_ai_engine_alive())
    t3 = asyncio.create_task(keep_backend_alive())
    _background_tasks = [t1, t2, t3]

    logger.info("🚀 RAHI Backend started — AI Engine & Backend maintenance tasks active")

    yield  # App is running

    # Shutdown
    logger.info("Shutting down background tasks ...")
    for task in _background_tasks:
        task.cancel()
    await asyncio.gather(*_background_tasks, return_exceptions=True)
    logger.info("RAHI Backend shutdown complete")


app = FastAPI(title="RAHI Backend", version="0.1.0", lifespan=lifespan)

app.mount("/static", StaticFiles(directory="static"), name="static")

# Security Middleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def read_root():
    return {"message": "Welcome to RAHI API", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

