from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import onboarding, predictions, chat, events, subscription, public
from app.core.config import settings

app = FastAPI(title="JyotishHardev API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.allowed_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


# Routes
app.include_router(onboarding.router, prefix="/api/v1")
app.include_router(predictions.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(events.router, prefix="/api/v1")
app.include_router(subscription.router, prefix="/api/v1")
app.include_router(public.router, prefix="/api/v1")
