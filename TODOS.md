# TODOS

## Live and working

- [x] Free Kundli generator — anonymous, no account, instant chart
- [x] ~~AI reading~~ — removed from UI; `/kundli/interpret` backend endpoint kept but not surfaced
- [x] Daily Cosmic Brief (Panchang) — Tithi, Nakshatra, Yoga, Moon sign + AI energy summary
- [x] Transits — current sidereal positions of all 9 grahas
- [x] Library — all 27 Nakshatras and 12 Rashis with descriptions
- [x] Palmistry guide — 8 tabbed sections, Hasta Samudrika Shastra
- [x] Til Vichar guide — 9 tabbed sections, Vedic mole reading
- [x] Hardev's world predictions — 12 predictions (4 confirmed, 8 pending), hardcoded in public.py
- [x] CORS open to all origins — no env var config needed
- [x] No database, no auth, no billing — fully stateless backend
- [x] POB autocomplete — Google Places, full formatted address, dropdown styled
- [x] Color consistency — all pages use cream (#f5f0e8) background, indigo text palette
- [x] Rate limiting on `/kundli/interpret` — 10 requests/hour per IP via slowapi
- [x] Share Kundli — "Share ↗" button copies URL with encoded birth details; auto-loads on visit
- [x] Social share buttons on results page — WhatsApp, X, Facebook, Telegram, Email, Copy link
- [x] Social share buttons on homepage hero — WhatsApp, X, Facebook, Telegram (shares site URL)
- [x] SEO — OG tags, Twitter cards, canonical URLs, sitemap.xml, robots.txt, JSON-LD on all pages

## Near-term improvements

- [ ] Google Places Autocomplete uses deprecated widget — monitor for breakage, migrate when needed
- [ ] 404 page — unknown routes show default Next.js blank; add a branded page
- [ ] Mobile nav audit — tab bars on palmistry and til-vichar have many tabs; check on small screens
- [x] Favicon — SVG wheel (primary) + PNG Om symbol fallbacks (16, 32, 192, 512px) + apple-touch-icon
- [x] OG image — 1200×630 branded indigo/gold card served at /og-image.png; summary_large_image on all pages
- [x] Google Search Console — verified via Namecheap TXT record (@), sitemap.xml submitted
- [ ] Vercel Deployment Protection — ensure set to "Only Preview Deployments" so Facebook/Google scrapers are not blocked (403)

## Content maintenance

- [ ] Predictions — review pending predictions quarterly; mark confirmed or missed as events resolve
- [ ] About page — currently brief; could expand with more about the Jyotish tradition

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
