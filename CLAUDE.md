# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

JyotishHardev is a free, no-login Vedic astrology website. Visitors get an instant Kundli chart, a static reading, and an optional AI interpretation — all anonymously, with no accounts and no payments.

## Project structure

```
JyotishHardev/
├── backend/          # FastAPI (Python) — stateless, no database
│   ├── app/
│   │   ├── api/      # public.py (kundli, panchang, AI reading, predictions)
│   │   │             # transits.py (current planetary positions)
│   │   ├── core/     # config.py (ANTHROPIC_API_KEY only)
│   │   └── services/ # chart.py (pyswisseph math), classifier.py (safe framing)
│   └── tests/
├── mobile/           # React Native (Expo) — not actively maintained
├── web/              # Next.js 14 Pages Router — main website
│   └── src/
│       ├── pages/    # All public, no auth
│       └── components/
└── infra/            # Docker, Railway config
```

## Commands

```bash
# Backend
cd backend && pip install -r requirements.txt
cd backend && uvicorn app.main:app --reload      # dev server
cd backend && pytest                              # run tests

# Web
cd web && npm install
cd web && npm run dev
```

## Key architectural rules

1. **Ephemeris is math, not LLM.** Planetary positions are computed by `pyswisseph`. The LLM only interprets pre-computed data — it never generates chart positions.
2. **No database.** The backend is fully stateless. Nothing is persisted. Every request is computed fresh.
3. **No auth.** There are no user accounts, no sessions, no tokens. All endpoints are public.
4. **Response classifier is mandatory.** Every LLM response must pass through `services/classifier.py` before reaching the user. It rewrites death framing to "health watch period" language. If the classifier errors, show a fallback — never pass raw output.
5. **World predictions are hardcoded.** Edit `_WORLD_PREDICTIONS` in `backend/app/api/public.py` directly to add or update Hardev's predictions. No admin UI or database needed.

## Backend API endpoints

All endpoints are under `/api/v1/` and require no auth:

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | Health check |
| `POST` | `/public/kundli` | Compute Kundli chart from birth details |
| `POST` | `/kundli/interpret` | AI reading via Claude (passes through classifier) |
| `GET` | `/public/panchang/today` | Today's Tithi, Nakshatra, Yoga, Moon sign |
| `GET` | `/public/transits/current` | Current sidereal positions of all 9 grahas |
| `GET` | `/public/predictions` | Hardev's world predictions (hardcoded in public.py) |

## Web pages

| Page | Route |
|------|-------|
| Homepage (Kundli generator) | `/` |
| About | `/about` |
| Daily Brief (Panchang) | `/daily` |
| Transits | `/transits` |
| Library (Nakshatras + Rashis) | `/library` |
| Palmistry guide | `/palmistry` |
| Til Vichar guide | `/til-vichar` |
| Hardev's predictions | `/predictions` |
| Nakshatra detail | `/nakshatras/[slug]` |
| Rashi detail | `/rashis/[slug]` |

## Environment variables

```
# Backend (Railway)
ANTHROPIC_API_KEY=...

# Web (Vercel)
NEXT_PUBLIC_API_URL=https://jyotishhardev-production.up.railway.app
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=...   # for POB autocomplete on homepage
```

## Deployment

- **Backend**: Railway (`jyotishhardev-production.up.railway.app`) — FastAPI + pyswisseph. No migrations, no DB.
- **Web**: Vercel (`jyotishhardev.com`) — Next.js 14 Pages Router. Auto-deploys from `main`.

## CORS

The backend uses `allow_origins=["*"]` with `allow_credentials=False`. Since there are no cookies or auth tokens, this is safe and means no CORS configuration is needed on Railway.

## Hook validator note

The PostToolUse:Edit hook reports `next/head` as an "error" on every `.tsx` file. This is a **false positive** — the project uses Next.js Pages Router, where `next/head` is correct. The `"use client"` suggestions are also wrong for Pages Router. Ignore all of these.

## Known open issues

- `/kundli/interpret` has no rate limiting — monitor Claude API costs
- Jaimini Chara Dasha not implemented (users always get Vimshottari)
- DPDPA `/account/delete` endpoint missing (not relevant until user accounts exist)
- Google Places Autocomplete uses the deprecated `Autocomplete` widget (still functional)
