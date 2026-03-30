import asyncio
import os
from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr

# Load env from backend/.env
# Assuming script is run from project root or backend/ logic needs path adjustment
# We'll load from explicit path relative to this script
import sys
from pathlib import Path

# Add backend dir to path if needed, but we essentially need .env
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

print(f"Loading env from: {env_path}")
print(f"MAIL_USERNAME: {os.getenv('MAIL_USERNAME')}")
# Do not print password

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def simple_send():
    print("Attempting to connect to SMTP server...")
    
    recipient = os.getenv("MAIL_USERNAME") # Send to self for testing
    
    html = """
    <p>This is a test email from RAHI Backend verification script.</p>
    <p>✅ SMTP is working correctly!</p>
    """

    message = MessageSchema(
        subject="RAHI SMTP Test Verification",
        recipients=[recipient],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        print("✅ Email sent successfully!")
    except Exception as e:
        print(f"❌ Failed to send email: {e}")

if __name__ == "__main__":
    asyncio.run(simple_send())
