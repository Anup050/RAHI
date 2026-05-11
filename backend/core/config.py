from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RAHI"
    API_V1_STR: str = "/api/v1"
    
    # DATABASE
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "rahi"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    
    MONGO_USER: str = ""
    MONGO_PASSWORD: str = ""
    MONGO_DB: str = "rahi_logs"
    MONGO_HOST: str = "localhost"
    MONGO_PORT: int = 27017
    MONGODB_URL: str | None = None
    DATABASE_URL: str | None = None
    AI_ENGINE_URL: str = "http://localhost:8001"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.DATABASE_URL:
            # Handle potential postgres:// vs postgresql:// issue for SQLAlchemy
            if self.DATABASE_URL.startswith("postgres://"):
                return self.DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
            if not self.DATABASE_URL.startswith("postgresql+asyncpg://"):
                 return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
            return self.DATABASE_URL
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    @property
    def MONGODB_URI(self) -> str:
        if self.MONGODB_URL:
            return self.MONGODB_URL
        return f"mongodb://{self.MONGO_USER}:{self.MONGO_PASSWORD}@{self.MONGO_HOST}:{self.MONGO_PORT}"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    # Security
    SECRET_KEY: str = "supersecretkeyforrahihealthcareplatform2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Email
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = "rahi.healthcare.app@gmail.com"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_FROM_NAME: str = "RAHI Healthcare"
    RESEND_API_KEY: str = ""

    # SMS
    SMS_PROVIDER: str = "mock" # mock or twilio
    TWILIO_SID: str = ""
    TWILIO_TOKEN: str = ""
    TWILIO_FROM: str = ""

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
