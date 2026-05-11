import httpx
import logging
from fastapi import BackgroundTasks
from core.config import settings

logger = logging.getLogger("rahi-backend")

async def _ping_ai_engine():
    """
    Internal helper to ping the AI engine.
    """
    try:
        url = f"{settings.AI_ENGINE_URL}/health"
        async with httpx.AsyncClient() as client:
            # Short timeout, we just want to wake it up
            response = await client.get(url, timeout=5.0)
            if response.status_code == 200:
                logger.info("AI Engine warmup successful")
            else:
                logger.warning(f"AI Engine warmup returned status {response.status_code}")
    except Exception as e:
        logger.error(f"AI Engine warmup failed: {e}")

def trigger_ai_warmup(background_tasks: BackgroundTasks):
    """
    Triggers the AI engine warmup in the background.
    """
    if not background_tasks:
        logger.warning("trigger_ai_warmup called without background_tasks")
        return
        
    logger.info("Triggering AI Engine warmup...")
    background_tasks.add_task(_ping_ai_engine)
