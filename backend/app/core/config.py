from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    anthropic_api_key: str
    supabase_url: str
    supabase_anon_key: str
    supabase_jwt_secret: str = ""
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    google_places_api_key: str = ""
    secret_key: str
    trial_days: int = 30
    chat_limit_trial: int = 5
    chat_limit_paid: int = 25
    session_memory_max: int = 20
    session_memory_cold_start: int = 3  # inject all sessions below this threshold
    allowed_origins: str = "http://localhost:3000"  # comma-separated list
    admin_email: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
