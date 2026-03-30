import sys
import os

# Add project root
sys.path.insert(0, os.getcwd())

from core.config import settings

def check_email_config():
    print("Checking Email Configuration...")
    missing = []
    if not settings.MAIL_USERNAME:
        missing.append("MAIL_USERNAME")
    if not settings.MAIL_PASSWORD:
        missing.append("MAIL_PASSWORD")
    
    if missing:
        print(f"❌ Email configuration missing: {', '.join(missing)}")
        print("Please add them to .env")
    else:
        print("✅ Email credentials are present.")
        print(f"Server: {settings.MAIL_SERVER}:{settings.MAIL_PORT}")
        print(f"From: {settings.MAIL_FROM}")

if __name__ == "__main__":
    check_email_config()
