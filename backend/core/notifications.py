import requests
import json
from typing import List, Optional
from core.config import settings

def send_push_notification(token: str, title: str, body: str, data: Optional[dict] = None):
    """
    Send a push notification via Expo.
    """
    if not token or not token.startswith("ExponentPushToken"):
        print(f"DEBUG: Invalid push token: {token}")
        return
        
    url = "https://exp.host/--/api/v2/push/send"
    payload = {
        "to": token,
        "title": title,
        "body": body,
        "sound": "default",
        "data": data or {}
    }
    
    try:
        response = requests.post(
            url,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Accept-encoding": "gzip, deflate",
            },
            data=json.dumps(payload),
            timeout=10
        )
        response.raise_for_status()
        print(f"DEBUG: Push notification sent to {token}: {response.status_code}")
    except Exception as e:
        print(f"DEBUG: Failed to send push notification: {e}")

def send_multicast_push_notification(tokens: List[str], title: str, body: str, data: Optional[dict] = None):
    """
    Send push notifications to multiple tokens.
    """
    for token in tokens:
        send_push_notification(token, title, body, data)
