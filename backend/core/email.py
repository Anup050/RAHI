import logging
import datetime
from pathlib import Path
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from starlette.background import BackgroundTasks
from core.config import settings

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
    VALIDATE_CERTS=False,
    TEMPLATE_FOLDER=TEMPLATE_FOLDER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME
)

async def send_otp_email(email_to: EmailStr, otp_code: str, background_tasks: BackgroundTasks, subject: str = "RAHI Health - Login Verification"):
    try:
        current_year = datetime.datetime.now().year
        
        # DEBUG: Print OTP to console for local development
        logger.info(f"🔑 OTP Code for {email_to}: {otp_code}")
        print(f"==================================================")
        print(f"🔑 OTP Code for {email_to}: {otp_code}")
        print(f"==================================================")

        if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
            logger.warning("⚠️ MAIL_USERNAME or MAIL_PASSWORD not set. Email will not be sent.")
            return

        message = MessageSchema(
            subject=subject,
            recipients=[email_to],
            template_body={
                "otp_code": otp_code,
                "current_year": current_year
            },
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        background_tasks.add_task(send_email_template, fm, message, "otp_email.html")
        logger.info(f"Queued OTP email for {email_to}")

    except Exception as e:
        logger.error(f"Failed to prepare OTP email for {email_to}: {str(e)}")

async def send_approval_email(email_to: EmailStr, doctor_name: str, background_tasks: BackgroundTasks):
    try:
        if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
            logger.warning("⚠️ Email config missing. Skipping approval email.")
            return

        message = MessageSchema(
            subject="RAHI Health - Account Approved!",
            recipients=[email_to],
            template_body={
                "doctor_name": doctor_name,
                "current_year": datetime.datetime.now().year
            },
            subtype=MessageType.html
        )
        fm = FastMail(conf)
        background_tasks.add_task(send_email_template, fm, message, "approval_email.html")
    except Exception as e:
        logger.error(f"Failed to prepare approval email: {str(e)}")

async def send_appointment_notification(
    email_to: EmailStr, 
    doctor_name: str, 
    patient_name: str, 
    time: str, 
    reason: str,
    mode: str,
    background_tasks: BackgroundTasks
):
    try:
        # Log to console for dev
        print(f"📧 Sending Appointment Notification to {email_to} (Doctor: {doctor_name}, Patient: {patient_name})")
        
        if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
            return

        message = MessageSchema(
            subject="RAHI Health - New Appointment Booked",
            recipients=[email_to],
            template_body={
                "doctor_name": doctor_name,
                "patient_name": patient_name,
                "appointment_time": time,
                "reason": reason,
                "mode": mode,
                "current_year": datetime.datetime.now().year
            },
            subtype=MessageType.html
        )
        fm = FastMail(conf)
        background_tasks.add_task(send_email_template, fm, message, "appointment_notification.html")
    except Exception as e:
        logger.error(f"Failed to prepare appointment email: {str(e)}")

async def send_appointment_confirmation(
    email_to: EmailStr,
    patient_name: str,
    doctor_name: str,
    time: str,
    mode: str,
    background_tasks: BackgroundTasks
):
    try:
        print(f"📧 Sending Confirmation Email to {email_to}")
        if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
            return

        message = MessageSchema(
            subject="RAHI Health - Appointment Confirmed!",
            recipients=[email_to],
            template_body={
                "patient_name": patient_name,
                "doctor_name": doctor_name,
                "appointment_time": time,
                "mode": mode,
                "current_year": datetime.datetime.now().year
            },
            subtype=MessageType.html
        )
        fm = FastMail(conf)
        background_tasks.add_task(send_email_template, fm, message, "appointment_confirmation.html")
    except Exception as e:
        logger.error(f"Failed to prepare confirmation email: {str(e)}")

async def send_appointment_rejection(
    email_to: EmailStr,
    patient_name: str,
    doctor_name: str,
    time: str,
    reason: str,
    background_tasks: BackgroundTasks
):
    try:
        print(f"📧 Sending Rejection Email to {email_to}")
        if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
            return

        message = MessageSchema(
            subject="RAHI Health - Appointment Update",
            recipients=[email_to],
            template_body={
                "patient_name": patient_name,
                "doctor_name": doctor_name,
                "appointment_time": time,
                "reason": reason,
                "current_year": datetime.datetime.now().year
            },
            subtype=MessageType.html
        )
        fm = FastMail(conf)
        background_tasks.add_task(send_email_template, fm, message, "appointment_rejection.html")
    except Exception as e:
        logger.error(f"Failed to prepare rejection email: {str(e)}")

async def send_consultation_completion(
    email_to: EmailStr,
    patient_name: str,
    doctor_name: str,
    background_tasks: BackgroundTasks
):
    try:
        print(f"📧 Sending Consultation Done Email to {email_to}")
        if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
            return

        message = MessageSchema(
            subject="RAHI Health - Consultation Completed",
            recipients=[email_to],
            template_body={
                "patient_name": patient_name,
                "doctor_name": doctor_name,
                "current_year": datetime.datetime.now().year
            },
            subtype=MessageType.html
        )
        fm = FastMail(conf)
        background_tasks.add_task(send_email_template, fm, message, "consultation_completion.html")
    except Exception as e:
        logger.error(f"Failed to prepare completion email: {str(e)}")

async def send_emergency_alert(
    email_to: EmailStr,
    recipient_name: str,
    patient_name: str,
    reason: str,
    target_doctor: str,
    background_tasks: BackgroundTasks
):
    try:
        print(f"🚨 Sending EMERGENCY EMAIL to {email_to}")
        if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
            return

        message = MessageSchema(
            subject="🚨 RAHI Health - EMERGENCY ALERT!",
            recipients=[email_to],
            template_body={
                "recipient_name": recipient_name,
                "patient_name": patient_name,
                "reason": reason,
                "target_doctor": target_doctor,
                "current_year": datetime.datetime.now().year
            },
            subtype=MessageType.html
        )
        fm = FastMail(conf)
        background_tasks.add_task(send_email_template, fm, message, "emergency_alert.html")
    except Exception as e:
        logger.error(f"Failed to prepare emergency email: {str(e)}")

async def send_rejection_email(email_to: EmailStr, doctor_name: str, reason: str, background_tasks: BackgroundTasks):
    try:
        if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
            return

        message = MessageSchema(
            subject="RAHI Health - Application Status Update",
            recipients=[email_to],
            template_body={
                "doctor_name": doctor_name,
                "reason": reason,
                "current_year": datetime.datetime.now().year
            },
            subtype=MessageType.html
        )
        fm = FastMail(conf)
        background_tasks.add_task(send_email_template, fm, message, "rejection_email.html")
    except Exception as e:
        logger.error(f"Failed to prepare rejection email: {str(e)}")

async def send_approval_email(email_to: EmailStr, doctor_name: str, background_tasks: BackgroundTasks):
    try:
        if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
            return

        message = MessageSchema(
            subject="Welcome to RAHI Health - Application Approved!",
            recipients=[email_to],
            template_body={
                "doctor_name": doctor_name,
                "current_year": datetime.datetime.now().year
            },
            subtype=MessageType.html
        )
        fm = FastMail(conf)
        background_tasks.add_task(send_email_template, fm, message, "approval_email.html")
    except Exception as e:
        logger.error(f"Failed to prepare approval email: {str(e)}")

async def send_admin_new_registration_notification(
    admin_email: EmailStr,
    doctor_name: str,
    doctor_email: str,
    specialization: str,
    background_tasks: BackgroundTasks
):
    try:
        if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
            return

        message = MessageSchema(
            subject="🔔 New Doctor Registration - Action Required",
            recipients=[admin_email],
            template_body={
                "doctor_name": doctor_name,
                "doctor_email": doctor_email,
                "specialization": specialization or "General",
                "reg_date": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
                "current_year": datetime.datetime.now().year
            },
            subtype=MessageType.html
        )
        fm = FastMail(conf)
        background_tasks.add_task(send_email_template, fm, message, "new_registration_notification.html")
    except Exception as e:
        logger.error(f"Failed to prepare admin notification email: {str(e)}")

async def send_email_template(fm: FastMail, message: MessageSchema, template_name: str):
    try:
        await fm.send_message(message, template_name=template_name)
        logger.info(f"✅ Email {template_name} sent successfully to {message.recipients}")
    except Exception as e:
        logger.error(f"❌ Failed to send email {template_name}. Error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
