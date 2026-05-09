# TODOS

## Phase 1 (weeks 1-6)

- [x] Onboarding API: birth details form, Google Places POB autocomplete, chart generation
- [x] Kundali chart generation worker (async, 5-year chunks, checkpoint on restart)
- [x] Milestone Oracle: generate prediction timeline, shareable share page (Next.js /share/:id)
- [x] Persistent chat API with rate limiting (5/day trial, 25/day paid) — mobile app only
- [x] Response classifier (rewrites death language) — required on ALL LLM responses
- [ ] Session memory: pgvector cosine similarity query (currently returns recency, not semantic similarity)
- [x] Event logging API + AccuracyCorpus atomic increment
- [ ] Daily transit push notification (Expo Notifications) — endpoint exists, cron not wired
- [x] Subscription: Stripe, idempotent webhook handler
- [x] Trial lifecycle: trial_expires_at, 402 on gated endpoints — mobile app only (web is now free)
- [ ] DPDPA consent at onboarding + /account/delete endpoint — required for India launch
- [x] Supabase auth integration

## Website (free, no login)

- [x] Free Kundli Generator — anonymous, no account needed
- [x] AI reading (Hardev interpretation) — free for all, no auth gate
- [x] Remove Sign in / Get started from nav
- [x] Remove auth redirect from _app.tsx
- [x] Fix CORS: add jyotishhardev.com to ALLOWED_ORIGINS on Railway
- [x] Fix transits page: `planets` key mismatch corrected
- [x] Fix predictions 500: alembic upgrade head now runs on every Railway deploy

## Mobile (React Native / Expo) — remaining gaps

- [ ] POB autocomplete: Google Places Places API hook not wired in POBScreen.tsx
- [ ] Planetary animation on Kundali generation screen (9 planets, sequential placement)
- [ ] Memory tag chips inside chat AI response bubbles
- [ ] Kundali chart: tap-to-fullscreen modal + pinch-to-zoom
- [ ] Session embedding: call Anthropic embeddings API to populate pgvector column
- [ ] Push notifications: wire daily transit cron to Expo Notifications
- [ ] Trial expiry soft banner (day 25 warning)

## Phase 1.5 (weeks 7-10) — gate: 500+ confirmed Events in AccuracyCorpus

- [ ] Accuracy dashboard (show confirmed_count per domain + dasha period)
- [ ] Disconfirm flow (user marks prediction as wrong)
- [ ] Hindi v1.1

## Phase 2 (months 3-6) — gate: Phase 1 success criteria met

- [ ] Astrologer CRM (B2B track, ₹1999/month)
- [ ] Family Kundali Graph (up to 5 members, OTP consent, DPDPA)
- [ ] Full Hindi localization
- [ ] Jaimini Chara Dasha computation (currently only Vimshottari is implemented)

## Design (from /plan-design-review)

- [x] Integrate Tiro Devanagari font (Google Fonts) for headings — web + mobile
- [ ] Implement planetary animation on Kundali generation screen (9 planets, sequential)
- [ ] Implement "Hardev" astrologer persona — avatar (⊕), letter-style response cards
- [ ] Memory tag as stamped seal inside response card (not external chip)
- [x] Gold (#C9A84C) never used for text — decorative/fill only (contrast too low)
- [ ] All touch targets ≥ 44×44px — audit before first TestFlight build
- [x] Share page: SSR no-JS fallback confirmed working
- [ ] Kundali chart: horizontal scroll on small screens + tap-to-fullscreen modal
- [ ] `prefers-reduced-motion` fallback for planetary animation (replace with progress bar)
- [ ] Screen reader labels for Kundali chart houses and milestone timeline rows

## Deferred (not in current scope)

- API licensing / platform play
- Gemstone / physical product recommendations
- Native chart interactions (zoom, tap-to-explain house)

## Before first public launch

- [x] Set up Stripe account + create subscription product (mobile app)
- [ ] Validate pyswisseph against known Kundali (regression test with verified birth chart)
- [ ] Legal review of milestone/death prediction framing
- [ ] DPDPA /account/delete endpoint (required for India launch)
- [ ] Rate limiting on /kundli/interpret (currently open — monitor Claude costs)
