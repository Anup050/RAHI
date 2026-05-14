import httpx
import asyncio
import logging
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from core.config import settings

logger = logging.getLogger("rahi-backend")

# ── Module-level state to track AI Engine availability ──
_ai_engine_ready = False


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
    Blocks up to ~90 seconds with exponential backoff.
    Called on-demand when a prediction request fails.
    """
    global _ai_engine_ready
    ai_url = settings.AI_ENGINE_URL.rstrip("/")
    health_url = f"{ai_url}/health"

    logger.info("On-demand AI Engine wake-up starting ...")
    async with httpx.AsyncClient(timeout=30.0) as client:
        delays = [5, 10, 15, 20, 20, 20]  # ~90 s total
        for i, delay in enumerate(delays, 1):
            if await _wake_ai_engine_once(client, health_url):
                logger.info(f"AI Engine is LIVE after on-demand wake (attempt {i})")
                _ai_engine_ready = True
                return
            logger.warning(f"AI Engine still waking (attempt {i}), retrying in {delay}s ...")
            await asyncio.sleep(delay)

    logger.error("AI Engine did not wake after on-demand attempts.")
    _ai_engine_ready = False


async def get_ai_prediction(symptoms: str) -> Dict[str, Any]:
    """
    Sends symptoms to the AI Engine and returns predictions.
    Includes retry logic and on-demand wake-up to survive Render cold starts.
    """
    ai_url = settings.AI_ENGINE_URL.rstrip("/")
    predict_url = f"{ai_url}/predict"
    payload = {"symptoms": symptoms, "text": symptoms}

    max_attempts = 3
    # Long timeout: Render cold start can take 30-60 s
    client_timeout = httpx.Timeout(connect=30.0, read=60.0, write=10.0, pool=10.0)

    async with httpx.AsyncClient(timeout=client_timeout) as client:
        for attempt in range(1, max_attempts + 1):
            try:
                response = await client.post(predict_url, json=payload)
                response.raise_for_status()
                data = response.json()
                logger.info(f"AI prediction success (attempt {attempt}): {data.get('predictions', [])}")
                return data

            except httpx.ConnectError as exc:
                logger.warning(f"AI Engine connection failed (attempt {attempt}): {exc}")
                if attempt < max_attempts:
                    # Trigger wake-up then retry
                    await _ensure_ai_engine_awake()
                    continue

            except httpx.ReadTimeout as exc:
                logger.warning(f"AI Engine read timeout (attempt {attempt}): {exc}")
                if attempt < max_attempts:
                    await asyncio.sleep(5)
                    continue

            except httpx.HTTPStatusError as exc:
                status = exc.response.status_code
                logger.warning(f"AI Engine returned {status} (attempt {attempt})")
                # 503 = model not loaded yet, retry after wake
                if status == 503 and attempt < max_attempts:
                    await _ensure_ai_engine_awake()
                    continue
                return {
                    "predictions": [],
                    "message": "AI Service error.",
                    "error": f"HTTP {status}"
                }

            except Exception as exc:
                logger.error(f"Unexpected AI Engine error (attempt {attempt}): {exc}")
                if attempt < max_attempts:
                    await asyncio.sleep(3)
                    continue

    # All attempts exhausted
    logger.error("AI Engine unreachable after all retry attempts.")
    return {
        "predictions": [],
        "message": "AI Service is starting up. Please try again in 1-2 minutes.",
        "error": "AI Engine cold start in progress"
    }
