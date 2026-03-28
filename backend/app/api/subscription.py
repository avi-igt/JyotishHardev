"""Subscription routes: Stripe webhook handler.

Idempotent: if subscription_id already matches, no update is made.
All payments go through Stripe.
"""
import json
import logging
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.models.profile import Profile

router = APIRouter(tags=["subscription"])
logger = logging.getLogger(__name__)


@router.post("/subscription/webhook/stripe", status_code=200)
async def stripe_webhook(request: Request, db: Session = Depends(get_db)) -> Dict[str, str]:
    """Handle Stripe payment events.

    Expected events:
    - invoice.payment_succeeded → activate subscription
    - customer.subscription.deleted → deactivate

    Idempotent: checks subscription_id before updating.
    Signature verified via Stripe-Signature header.
    """
    import stripe

    body_bytes = await request.body()
    sig_header = request.headers.get("Stripe-Signature", "")

    stripe.api_key = settings.stripe_secret_key

    if settings.stripe_webhook_secret and sig_header:
        try:
            event_obj = stripe.Webhook.construct_event(
                body_bytes, sig_header, settings.stripe_webhook_secret
            )
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Invalid Stripe signature")
    else:
        event_obj = json.loads(body_bytes)

    event_type = event_obj.get("type", "")
    data = event_obj.get("data", {}).get("object", {})

    subscription_id = data.get("subscription") or data.get("id")
    user_id = data.get("metadata", {}).get("user_id")

    if not subscription_id or not user_id:
        logger.warning("Stripe webhook missing subscription_id or user_id")
        return {"status": "ignored"}

    if event_type == "invoice.payment_succeeded":
        _activate_subscription(db, user_id, subscription_id)
    elif event_type in ("customer.subscription.deleted", "customer.subscription.paused"):
        _deactivate_subscription(db, user_id, subscription_id)
    else:
        logger.info(f"Unhandled Stripe event: {event_type}")

    return {"status": "ok"}


def _activate_subscription(db: Session, user_id: str, subscription_id: str) -> None:
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        logger.warning(f"Profile not found for user_id={user_id}")
        return
    if profile.subscription_id == subscription_id and profile.subscription_active:
        logger.info(f"Idempotent skip: subscription {subscription_id} already active")
        return
    profile.subscription_active = True
    profile.subscription_provider = "stripe"
    profile.subscription_id = subscription_id
    db.commit()
    logger.info(f"Activated subscription {subscription_id} for user {user_id}")


def _deactivate_subscription(db: Session, user_id: str, subscription_id: str) -> None:
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        return
    if profile.subscription_id != subscription_id:
        logger.info(f"Ignoring deactivation for {subscription_id} — current is {profile.subscription_id}")
        return
    profile.subscription_active = False
    db.commit()
    logger.info(f"Deactivated subscription {subscription_id} for user {user_id}")
