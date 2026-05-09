# TODOS

## Live and working

- [x] Free Kundli generator — anonymous, no account, instant chart
- [x] AI reading (Hardev interpretation) — free for all, no auth gate
- [x] Daily Cosmic Brief (Panchang) — Tithi, Nakshatra, Yoga, Moon sign + AI energy summary
- [x] Transits — current sidereal positions of all 9 grahas
- [x] Library — all 27 Nakshatras and 12 Rashis with descriptions
- [x] Palmistry guide — static educational content
- [x] Til Vichar guide — static educational content
- [x] Hardev's world predictions — hardcoded, editable in public.py
- [x] CORS open to all origins — no env var config needed
- [x] No database, no auth, no billing — fully stateless backend

## Near-term improvements

- [ ] Rate limiting on `/kundli/interpret` — currently unmetered, monitor Claude costs
- [ ] POB autocomplete: Google Places hook not wired in homepage (lat/lon fallback works)
- [ ] Add real world predictions to `_WORLD_PREDICTIONS` in `backend/app/api/public.py`

## Design polish

- [ ] Planetary animation on homepage while Kundli computes (9 planets, sequential)
- [ ] All touch targets ≥ 44×44px audit before wider promotion
- [ ] `prefers-reduced-motion` fallback for any animation
- [ ] Screen reader labels for Kundali chart houses

## Deferred / not in scope

- Mobile app (React Native / Expo) — exists in repo but not actively maintained
- User accounts, chat, session memory
- Subscription billing
- Astrologer CRM (B2B)
- Family Kundali graph
- Jaimini Chara Dasha
- DPDPA `/account/delete` (only needed when user accounts exist)
