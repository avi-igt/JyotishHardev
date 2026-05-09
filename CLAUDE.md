# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

JyotishHardev is a persistent Vedic astrology app. The key differentiator is **memory** — unlike every other astrology app, JyotishHardev remembers every session, tracks which predictions came true, and builds an accuracy score over time. See DESIGN.md for the full product design.

## Project structure

```
JyotishHardev/
├── backend/          # FastAPI (Python) — ephemeris + AI + data
│   ├── app/
│   │   ├── api/      # Route handlers
│   │   ├── core/     # Config, auth, db session
│   │   ├── models/   # SQLAlchemy models
│   │   ├── services/ # Business logic (chart, llm, memory, billing)
│   │   └── workers/  # Background jobs (prediction generation, session embedding)
│   └── tests/
├── mobile/           # React Native (Expo) — main app
│   └── src/
│       ├── screens/
│       ├── components/
│       ├── hooks/
│       └── services/ # API client
├── web/              # Next.js — share page only (/share/:id)
│   └── src/
│       ├── pages/
│       └── components/
├── shared/           # Types shared between mobile + web
└── infra/            # Docker, Railway/Render config
```

## Commands

```bash
# Backend
cd backend && pip install -r requirements.txt
cd backend && uvicorn app.main:app --reload      # dev server
cd backend && pytest                              # run tests

# Mobile
cd mobile && npm install
cd mobile && npx expo start                       # dev server

# Web (share page)
cd web && npm install
cd web && npm run dev
```

## Key architectural rules

1. **Ephemeris is math, not LLM.** Planetary positions are computed by `pyswisseph`. The LLM only interprets pre-computed data — it never generates chart positions.
2. **Memory cold start.** Sessions 1-3: inject all session summaries directly into prompt. Session 4+: pgvector cosine similarity, top-5 relevant sessions. (Note: pgvector query not yet implemented — currently returns recency.)
3. **Response classifier is mandatory.** Every LLM response must pass through the classifier before reaching the user. It rewrites death framing to "health watch period" language. If the classifier errors, show a fallback — never pass raw output.
4. **Trial is server-enforced on mobile only.** `trial_expires_at` on Profile. API returns 402 for gated chat/prediction endpoints after expiry. The website (`jyotishhardev.com`) is fully free — no auth, no trial, no paywall. `/kundli/interpret` is public.
5. **Prediction generation is async.** Generated in 5-year chunks at onboarding, checkpointed in `generation_status` on Kundali. Worker resumes from checkpoint on restart.
6. **AccuracyCorpus is atomic.** Confirmed event increments use atomic DB operations — no double-counting on concurrent confirms.
7. **Payment routing.** Stripe only. Webhook handlers must be idempotent (same event fired twice = no state change).

## Data model highlights

- `Profile.tradition` — `parashara` or `jaimini`. Set once at onboarding, never changeable.
- `SessionMemory` — max 20 per user. Session 21 prunes session 1 and updates vector index.
- `AccuracyCorpus` — anonymized aggregate only. Never stores individual user data.
- `schema_version` on Profile and Kundali — old records need migration or graceful error on read.

## Environment variables needed

```
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
GOOGLE_PLACES_API_KEY=...
SECRET_KEY=...
```

## Deployment

- **Backend**: Railway (`jyotishhardev-production.up.railway.app`) — FastAPI + pyswisseph
  - `railway.toml` runs `alembic upgrade head` before every deploy
  - Set `ALLOWED_ORIGINS=https://www.jyotishhardev.com,http://localhost:3000` in Railway env vars
- **Web**: Vercel (`jyotishhardev.com`) — Next.js 14 Pages Router. Auto-deploys from `main`.
- **Mobile**: Expo (not yet published to App Store / Play Store)

## Critical path to test before shipping

See `backend/tests/` — the test plan in DESIGN.md defines the critical paths:
1. Homepage Kundli form → chart + AI reading displayed inline, no login required
2. Birth details → chart computed → Predictions generated → dashboard loads (mobile)
3. Chat message → classifier → response with memory tags → session summary embedded
4. Event confirmed → AccuracyCorpus.confirmed_count increments
5. Trial expires (mobile) → 402 on /api/v1/chat → Kundali + /share/:id still return 200
6. Payment webhook → subscription activated → paid rate limit applies

## Payment: Stripe only

All subscriptions go through Stripe. No Razorpay. To get your keys:
- `STRIPE_SECRET_KEY`: dashboard.stripe.com → Developers → API keys → Secret key
- `STRIPE_WEBHOOK_SECRET`: dashboard.stripe.com → Developers → Webhooks → Add endpoint → `whsec_...`
  - Endpoint URL: `https://yourapp.com/api/v1/subscription/webhook/stripe`
  - Events to listen for: `invoice.payment_succeeded`, `customer.subscription.deleted`

## Known open issues

- `pgvector` cosine similarity not implemented — `services/memory.py` returns recency for session 4+
- `/kundli/interpret` is now public with no rate limiting — monitor Claude costs; add IP-based limiting if needed
- Jaimini Chara Dasha not implemented — users who select Jaimini tradition get Vimshottari dasha
- DPDPA `/account/delete` endpoint missing — required before India launch
