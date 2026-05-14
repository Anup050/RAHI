import httpx
import asyncio
import logging
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from core.config import settings

logger = logging.getLogger("rahi-backend")

# ── Module-level state to track AI Engine availability ──
_ai_engine_ready = False
_wake_lock = asyncio.Lock()
_wake_in_progress = False


async def _wake_ai_engine_once(client: httpx.AsyncClient, health_url: str) -> bool:
    """Single attempt to ping the AI Engine health endpoint and check if model is ready."""
    try:
        resp = await client.get(health_url)
        if resp.status_code == 200:
            data = resp.json()
            # With lazy loading, we must check if the model is actually ready
            if data.get("model_loaded") is True:
                return True
    except Exception:
        pass
    return False


async def _ensure_ai_engine_awake() -> None:
    """
    Wake the AI Engine if it's sleeping on Render.
    Uses a lock to ensure only one wake-up loop runs at a time.
    Blocks up to ~3 minutes with progressive backoff.
    """
    global _ai_engine_ready, _wake_in_progress
    
    if _wake_in_progress:
        return

    async with _wake_lock:
        _wake_in_progress = True
        try:
            ai_url = settings.AI_ENGINE_URL.rstrip("/")
            health_url = f"{ai_url}/health"

            logger.info("On-demand AI Engine wake-up starting ...")
            async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
                # Progressive delays: 5, 10, 15, 20, 30, 30, 30, 30 = ~190s total
                delays = [5, 10, 15, 20, 30, 30, 30, 30] 
                for i, delay in enumerate(delays, 1):
                    if await _wake_ai_engine_once(client, health_url):
                        logger.info(f"AI Engine is LIVE after on-demand wake (attempt {i})")
                        _ai_engine_ready = True
                        return
                    logger.warning(f"AI Engine still waking (attempt {i}/{len(delays)}), retrying in {delay}s ...")
                    await asyncio.sleep(delay)

            logger.error("AI Engine did not wake after on-demand attempts.")
            _ai_engine_ready = False
        finally:
            _wake_in_progress = False


async def get_ai_prediction(symptoms: str) -> Dict[str, Any]:
    """
    Sends symptoms to the AI Engine and returns predictions.
    Includes robust retry logic and on-demand wake-up to survive Render cold starts.
    """
    ai_url = settings.AI_ENGINE_URL.rstrip("/")
    predict_url = f"{ai_url}/predict"
    payload = {"symptoms": symptoms, "text": symptoms}

    max_attempts = 6
    # Long timeout: Render cold start can take 30-60 s
    client_timeout = httpx.Timeout(connect=30.0, read=60.0, write=15.0, pool=10.0)

    async with httpx.AsyncClient(timeout=client_timeout, follow_redirects=True) as client:
        for attempt in range(1, max_attempts + 1):
            try:
                response = await client.post(predict_url, json=payload)
                response.raise_for_status()
                data = response.json()
                logger.info(f"AI prediction success (attempt {attempt}): {data.get('predictions', [])}")
                return data

            except (httpx.ConnectError, httpx.ConnectTimeout) as exc:
                logger.warning(f"AI Engine connection failed (attempt {attempt}/{max_attempts}): {exc}")
                if attempt < max_attempts:
                    asyncio.create_task(_ensure_ai_engine_awake())
                    # Wait: 5, 10, 15, 20, 20...
                    await asyncio.sleep(min(5 * attempt, 20))
                    continue

            except httpx.ReadTimeout as exc:
                logger.warning(f"AI Engine read timeout (attempt {attempt}/{max_attempts}): {exc}")
                if attempt < max_attempts:
                    await asyncio.sleep(5)
                    continue

            except httpx.HTTPStatusError as exc:
                status = exc.response.status_code
                logger.warning(f"AI Engine status {status} (attempt {attempt}/{max_attempts})")
                
                if status in [502, 503, 504] and attempt < max_attempts:
                    logger.info(f"Transient {status} detected, triggering background wake-up...")
                    asyncio.create_task(_ensure_ai_engine_awake())
                    # Delays: 5, 10, 15, 20, 20... total wait ~70-90s
                    await asyncio.sleep(min(5 * attempt, 20))
                    continue
                
                return {
                    "predictions": [],
                    "message": "AI Service error.",
                    "error": f"HTTP {status}"
                }

            except Exception as exc:
                logger.error(f"Unexpected AI Engine error (attempt {attempt}/{max_attempts}): {exc}")
                if attempt < max_attempts:
                    await asyncio.sleep(5)
                    continue

    # All attempts exhausted
    logger.error("AI Engine unreachable after all retry attempts.")
    return {
        "predictions": [],
        "message": "AI Service is still warming up. This can take up to 90 seconds on the first request of the day.",
        "error": "AI Engine cold start exceeded timeout"
    }
