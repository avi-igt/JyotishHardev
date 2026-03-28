# TODOS

## Phase 1 (weeks 1-6)

- [ ] Onboarding API: birth details form, Google Places POB autocomplete, chart generation
- [ ] Kundali chart generation worker (async, 5-year chunks, checkpoint on restart)
- [ ] Milestone Oracle: generate prediction timeline, shareable share page (Next.js /share/:id)
- [ ] Persistent chat API with rate limiting (5/day trial, 25/day paid)
- [ ] Response classifier (rewrites death language) — required on ALL LLM responses
- [ ] Session memory embedding + pgvector retrieval (cold start: sessions 1-3 inject all)
- [ ] Event logging API + AccuracyCorpus atomic increment
- [ ] Daily transit push notification (Expo Notifications)
- [ ] Subscription: Stripe, idempotent webhook handler
- [ ] Trial lifecycle: trial_expires_at, 402 on gated endpoints, upgrade CTA from day 25
- [ ] DPDPA consent at onboarding + /account/delete endpoint
- [ ] Supabase auth integration

## Phase 1.5 (weeks 7-10) — gate: 500+ confirmed Events in AccuracyCorpus

- [ ] Accuracy dashboard (show confirmed_count per domain + dasha period)
- [ ] Disconfirm flow (user marks prediction as wrong)
- [ ] Hindi v1.1

## Phase 2 (months 3-6) — gate: Phase 1 success criteria met

- [ ] Astrologer CRM (B2B track, ₹1999/month)
- [ ] Family Kundali Graph (up to 5 members, OTP consent, DPDPA)
- [ ] Full Hindi localization

## Design (from /plan-design-review)

- [ ] Integrate Tiro Devanagari font (Google Fonts) for headings
- [ ] Implement planetary animation on Kundali generation screen (9 planets, sequential)
- [ ] Implement "Hardev" astrologer persona — avatar (⊕), letter-style response cards
- [ ] Memory tag as stamped seal inside response card (not external chip)
- [ ] Gold (#C9A84C) never used for text — decorative/fill only (contrast too low)
- [ ] All touch targets ≥ 44×44px — audit before first TestFlight build
- [ ] Share page: test no-JS fallback (SSR must render full timeline without client JS)
- [ ] Kundali chart: horizontal scroll on small screens + tap-to-fullscreen modal
- [ ] `prefers-reduced-motion` fallback for planetary animation (replace with progress bar)
- [ ] Screen reader labels for Kundali chart houses and milestone timeline rows

## Deferred (not in current scope)

- API licensing / platform play
- Gemstone / physical product recommendations
- Native chart interactions (zoom, tap-to-explain house)

## Before first commit

- [ ] Set up Stripe account + create subscription product ($X/month)
- [ ] Validate pyswisseph against known Kundali (regression test with verified birth chart)
- [ ] Legal review of milestone/death prediction framing
