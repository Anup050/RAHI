from fastapi import APIRouter

from api.v1.endpoints import auth, users, analytics, login, otp, appointments, symptoms, notifications, prescriptions, notes, video, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(login.router, prefix="/auth", tags=["login"])
api_router.include_router(otp.router, prefix="/otp", tags=["otp"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(symptoms.router, prefix="/symptoms", tags=["symptoms"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(prescriptions.router, prefix="/prescriptions", tags=["prescriptions"])
api_router.include_router(notes.router, prefix="/notes", tags=["notes"])
api_router.include_router(video.router, prefix="/video", tags=["video"])
