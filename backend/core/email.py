import logging
import datetime
import httpx
from pathlib import Path
from pydantic import EmailStr
from starlette.background import BackgroundTasks
from core.config import settings

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Template Path
TEMPLATE_FOLDER = Path(__file__).parent.parent / "templates"

from jinja2 import Environment, FileSystemLoader
jinja_env = Environment(loader=FileSystemLoader(TEMPLATE_FOLDER))


async def _send_via_resend(email_to: str, subject: str, template_name: str, template_data: dict):
    """Send email using Resend HTTP API."""
    if not settings.RESEND_API_KEY:
        logger.error("❌ RESEND_API_KEY not set. Cannot send email.")
        return False

    try:
        template = jinja_env.get_template(template_name)
        html_content = template.render(**template_data)

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": "RAHI Healthcare <noreply@rahihealth.tech>",
                    "to": [email_to],
                    "subject": subject,
                    "html": html_content,
                },
            )
            if response.status_code in [200, 201]:
                logger.info(f"✅ Email {template_name} sent via Resend to {email_to}")
                return True
            else:
                logger.error(f"❌ Resend API Error ({response.status_code}): {response.text}")
                return False
    except Exception as e:
        logger.error(f"❌ Resend Exception: {str(e)}")
        return False


# ──────────────────────────────────────────────
# Public email functions
# ──────────────────────────────────────────────

async def send_otp_email(email_to: EmailStr, otp_code: str, background_tasks: BackgroundTasks, subject: str = "RAHI Health - Login Verification"):
    try:
        current_year = datetime.datetime.now().year
        template_data = {"otp_code": otp_code, "current_year": current_year}

        logger.info(f"🔑 OTP Code for {email_to}: {otp_code}")
        print("=" * 50)
        print(f"🔑 OTP Code for {email_to}: {otp_code}")
        print("=" * 50)

        background_tasks.add_task(_send_via_resend, email_to, subject, "otp_email.html", template_data)
        logger.info(f"Queued OTP email for {email_to}")
    except Exception as e:
        logger.error(f"Failed to prepare OTP email: {str(e)}")


async def send_approval_email(email_to: EmailStr, doctor_name: str, background_tasks: BackgroundTasks):
    try:
        template_data = {
            "doctor_name": doctor_name,
            "current_year": datetime.datetime.now().year
        }
        background_tasks.add_task(
            _send_via_resend, email_to,
            "Welcome to RAHI Health - Application Approved!",
            "approval_email.html", template_data
        )
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
        logger.info(f"📧 Queuing Appointment Notification to {email_to}")
        template_data = {
            "doctor_name": doctor_name,
            "patient_name": patient_name,
            "appointment_time": time,
            "reason": reason,
            "mode": mode,
            "current_year": datetime.datetime.now().year
        }
        background_tasks.add_task(
            _send_via_resend, email_to,
            "RAHI Health - New Appointment Booked",
            "appointment_notification.html", template_data
        )
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
        logger.info(f"📧 Queuing Confirmation Email to {email_to}")
        template_data = {
            "patient_name": patient_name,
            "doctor_name": doctor_name,
            "appointment_time": time,
            "mode": mode,
            "current_year": datetime.datetime.now().year
        }
        background_tasks.add_task(
            _send_via_resend, email_to,
            "RAHI Health - Appointment Confirmed!",
            "appointment_confirmation.html", template_data
        )
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
        logger.info(f"📧 Queuing Rejection Email to {email_to}")
        template_data = {
            "patient_name": patient_name,
            "doctor_name": doctor_name,
            "appointment_time": time,
            "reason": reason,
            "current_year": datetime.datetime.now().year
        }
        background_tasks.add_task(
            _send_via_resend, email_to,
            "RAHI Health - Appointment Update",
            "appointment_rejection.html", template_data
        )
    except Exception as e:
        logger.error(f"Failed to prepare rejection email: {str(e)}")


async def send_consultation_completion(
    email_to: EmailStr,
    patient_name: str,
    doctor_name: str,
    background_tasks: BackgroundTasks
):
    try:
        logger.info(f"📧 Queuing Consultation Done Email to {email_to}")
        template_data = {
            "patient_name": patient_name,
            "doctor_name": doctor_name,
            "current_year": datetime.datetime.now().year
        }
        background_tasks.add_task(
            _send_via_resend, email_to,
            "RAHI Health - Consultation Completed",
            "consultation_completion.html", template_data
        )
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
        logger.info(f"🚨 Queuing EMERGENCY EMAIL to {email_to}")
        template_data = {
            "recipient_name": recipient_name,
            "patient_name": patient_name,
            "reason": reason,
            "target_doctor": target_doctor,
            "current_year": datetime.datetime.now().year
        }
        background_tasks.add_task(
            _send_via_resend, email_to,
            "🚨 RAHI Health - EMERGENCY ALERT!",
            "emergency_alert.html", template_data
        )
    except Exception as e:
        logger.error(f"Failed to prepare emergency email: {str(e)}")


async def send_rejection_email(email_to: EmailStr, doctor_name: str, reason: str, background_tasks: BackgroundTasks):
    try:
        template_data = {
            "doctor_name": doctor_name,
            "reason": reason,
            "current_year": datetime.datetime.now().year
        }
        background_tasks.add_task(
            _send_via_resend, email_to,
            "RAHI Health - Application Status Update",
            "rejection_email.html", template_data
        )
    except Exception as e:
        logger.error(f"Failed to prepare rejection email: {str(e)}")


async def send_admin_new_registration_notification(
    admin_email: EmailStr,
    doctor_name: str,
    doctor_email: str,
    specialization: str,
    background_tasks: BackgroundTasks
):
    try:
        template_data = {
            "doctor_name": doctor_name,
            "doctor_email": doctor_email,
            "specialization": specialization or "General",
            "reg_date": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
            "current_year": datetime.datetime.now().year
        }
        background_tasks.add_task(
            _send_via_resend, admin_email,
            "🔔 New Doctor Registration - Action Required",
            "new_registration_notification.html", template_data
        )
    except Exception as e:
        logger.error(f"Failed to prepare admin notification email: {str(e)}")
