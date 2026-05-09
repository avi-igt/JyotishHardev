# JyotishHardev — Design Reference

> Free, anonymous Vedic astrology website. No accounts, no payments, no database.
> Updated: May 2026.

---

## What it is

A public website where anyone can generate an instant Vedic birth chart (Kundli),
get a static interpretation, and request an AI reading from Hardev — the astrologer persona.
No login, no subscription, nothing to install.

---

## Pages

| Route | What it does |
|-------|-------------|
| `/` | Free Kundli generator — enter birth details, get chart + static reading + optional AI reading |
| `/daily` | Today's Panchang — Tithi, Nakshatra, Yoga, Moon sign with AI energy summary |
| `/transits` | Current sidereal positions of all 9 grahas (Lahiri ayanamsha) |
| `/predictions` | Hardev's world predictions with accuracy tracking |
| `/library` | Index of all 27 Nakshatras and 12 Rashis with descriptions |
| `/palmistry` | Static palm reading educational guide |
| `/til-vichar` | Static Tithi / Nakshatra / Yoga guide |
| `/about` | About the project |
| `/nakshatras/[slug]` | Individual Nakshatra detail page |
| `/rashis/[slug]` | Individual Rashi detail page |

---

## Technical architecture

```
Browser
  └── Next.js 14 (Vercel) — Pages Router, no auth, no Supabase
        └── fetch → FastAPI (Railway) — stateless, no database
              ├── pyswisseph  — ephemeris math (planetary positions)
              ├── anthropic   — AI readings (Claude API)
              └── classifier  — mandatory safety gate on all LLM output
```

**The backend has no database.** Every request is computed fresh. Nothing is stored.

---

## Backend endpoints

All at `https://jyotishhardev-production.up.railway.app/api/v1/`:

| Method | Path | What it does |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/public/kundli` | Compute Kundli from birth details (pyswisseph) |
| `POST` | `/kundli/interpret` | AI reading via Claude (classifier applied) |
| `GET` | `/public/panchang/today` | Today's Tithi, Nakshatra, Yoga, Moon sign |
| `GET` | `/public/transits/current` | Current 9-graha sidereal positions |
| `GET` | `/public/predictions` | Hardev's world predictions (hardcoded in public.py) |

---

## Ephemeris rules

- **Planetary positions are math, never LLM.** `pyswisseph` computes all positions.
- Ayanamsha: Lahiri (sidereal, `swe.SIDM_LAHIRI`).
- Rahu/Ketu: always retrograde by convention. Ketu = Rahu + 180°.
- Dasha: Vimshottari only. Jaimini not implemented.
- Unknown birth time: noon chart with disclaimer on output.

---

## Response classifier

Every LLM response **must** pass through `services/classifier.py` before the user sees it.
It rewrites death-language framing to "health watch period" language.
If the classifier throws, show `FALLBACK_MESSAGE` — never expose raw LLM output.

---

## Hardev's world predictions

Hardcoded as a Python list `_WORLD_PREDICTIONS` at the bottom of `backend/app/api/public.py`.
To add or update predictions: edit that list, deploy. No admin UI, no database.

Each entry:
```python
{
    "id": "unique-string",
    "topic": "India / Global / Technology / ...",
    "text": "Prediction text here.",
    "posted_at": "YYYY-MM-DD",
    "target_date": "YYYY-MM-DD",  # optional
    "status": "pending",  # or "confirmed" or "missed"
}
```

---

## Design system

### Colour palette

| Token | Hex | Use |
|-------|-----|-----|
| Background | `#F5F0E8` | Page background — warm cream |
| Surface | `#FFFFFF` | Cards |
| Primary | `#1B1F4A` | Headers, nav, primary actions — deep indigo |
| Accent | `#C9A84C` | Borders, icons, active states — temple gold |
| Text | `#1A1A2E` | Body copy |
| Muted | `#6B6B8A` | Secondary text, labels |
| Error | `#C0392B` | Errors only |
| Success | `#27AE60` | Confirmation |

**Gold (#C9A84C) is decorative only — never use it for text.** It fails contrast at 2.9:1.

### Typography

- **Headings:** Tiro Devanagari Hindi (Google Fonts) → Georgia → serif
- **Body:** -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- Body minimum: 16px. Nothing below 12px in any state.

### Spacing

4px base unit: 4, 8, 12, 16, 24, 32, 48, 64px. Nothing outside this scale.

### Component tokens

```
Border radius: 12px cards  |  24px buttons  |  4px chips
Shadow:        0 2px 8px rgba(27,31,74,0.08)
Transition:    200ms ease
Touch target:  Minimum 44×44px
```

---

## Visual identity rules

**What JyotishHardev looks like:**
- Indigo + gold on warm cream — evokes night sky, sacred manuscripts, temple gold
- Headings in Tiro Devanagari — evokes classical scripts, not a tech product
- Charts use South Indian 4×4 grid — the format devout believers recognise
- Planet abbreviations in Sanskrit: Su, Mo, Ma, Bu, Gu, Sk, Sa, Ra, Ke

**What it does not look like:**
- No saffron/orange — every competitor uses it
- No "Your personal AI astrologer" hero headline
- No 3-column feature marketing cards
- No generic gradients
- No star or sparkle emoji in UI chrome

### Hardev persona

The AI reading is attributed to **Hardev** — a learned astrologer, not a chatbot.
- Never: "As an AI language model..."
- Always: warm, specific, first-person ("Your Moon in Vrishchika suggests...")
- Response cards styled as correspondence, not chat bubbles

---

## Kundli chart format

South Indian 4×4 grid. Non-negotiable — do not substitute North Indian diamond format.
Fixed minimum 320×320px. Horizontal scroll on viewports narrower than 320px.

---

## Accessibility

- Indigo on cream: 12.1:1 contrast ✓ (exceeds AAA)
- All body text: minimum 4.5:1 contrast ratio
- All touch targets: minimum 44×44px
- Kundali chart houses: `aria-label="House N: [planets]"`
- `prefers-reduced-motion`: replace planetary animation with a progress bar

---

## What was intentionally removed

The original design had persistent user accounts, chat with session memory,
pgvector similarity search, Stripe subscriptions, Celery workers, an Astrologer CRM,
and a Family Kundali graph. All of it was removed in May 2026.

**Reason:** The owner has no intention of monetising the site and wants zero maintenance burden.
The free, stateless version delivers the core value (instant Kundli + AI reading) at
essentially zero operating cost (Railway free tier + Claude API pay-per-use).

If you are considering re-adding any of the removed features, read the original design at
git tag `pre-simplification` or in the git history before commit `030ef6b`.
