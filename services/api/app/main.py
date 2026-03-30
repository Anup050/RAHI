from fastapi import FastAPI
from app.core.config import settings

app = FastAPI(title="RAHI Backend", version="0.1.0")

# Security Middleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8081", # Expo Web
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

from app.api.v1.api import api_router
from app.db.session import init_mongo
from app.jobs.scheduler import start_scheduler

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def startup_event():
    await init_mongo()
    start_scheduler()


@app.get("/")
def read_root():
    return {"message": "Welcome to RAHI API", "status": "running"}
