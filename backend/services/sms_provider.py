import abc
from core.config import settings

class SMSProvider(abc.ABC):
    @abc.abstractmethod
    def send_sms(self, to: str, message: str):
        pass

class MockSMSProvider(SMSProvider):
    def send_sms(self, to: str, message: str):
        print(f"--- [MOCK SMS] To: {to} | Message: {message} ---")

class TwilioSMSProvider(SMSProvider):
    def send_sms(self, to: str, message: str):
        # Placeholder for real implementation
        # client = Client(settings.TWILIO_SID, settings.TWILIO_TOKEN)
        # client.messages.create(body=message, from_=settings.TWILIO_FROM, to=to)
        print(f"--- [TWILIO SMS] To: {to} | Message: {message} ---")

def get_sms_provider() -> SMSProvider:
    if settings.SMS_PROVIDER.lower() == "twilio":
        return TwilioSMSProvider()
    return MockSMSProvider()
