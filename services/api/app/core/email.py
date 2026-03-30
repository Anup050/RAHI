import logging
import datetime
from pathlib import Path
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from starlette.background import BackgroundTasks
from app.core.config import settings

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Template Path
TEMPLATE_FOLDER = Path(__file__).parent.parent / "templates"

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
    TEMPLATE_FOLDER=TEMPLATE_FOLDER
)

async def send_otp_email(email_to: EmailStr, otp_code: str, background_tasks: BackgroundTasks):
    try:
        current_year = datetime.datetime.now().year
        
        message = MessageSchema(
            subject="RAHI Health - Login Verification",
            recipients=[email_to],
            template_body={
                "otp_code": otp_code,
                "current_year": current_year
            },
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        
        # Use background task wrapper for logging
        background_tasks.add_task(send_email_background, fm, message, email_to)
        logger.info(f"Queued OTP email for {email_to}")

    except Exception as e:
        logger.error(f"Failed to prepare OTP email for {email_to}: {str(e)}")

async def send_email_background(fm: FastMail, message: MessageSchema, email_to: str):
    try:
        await fm.send_message(message, template_name="otp_email.html")
        logger.info(f"✅ OTP email sent successfully to {email_to}")
    except Exception as e:
        logger.error(f"❌ Failed to send email to {email_to}: {str(e)}")
