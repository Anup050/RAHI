from fastapi import APIRouter

from api.v1.endpoints import auth, symptoms, otp, login, users, appointments

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(login.router, prefix="/auth", tags=["login"])
api_router.include_router(symptoms.router, prefix="/symptoms", tags=["symptoms"])
api_router.include_router(otp.router, prefix="/otp", tags=["otp"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
