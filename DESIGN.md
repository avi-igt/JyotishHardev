# JyotishHardev — The Persistent Vedic Astrologer

> Design doc reconstructed from planning sessions on 2026-03-21.
> Three reviews completed: /office-hours → /plan-ceo-review → /plan-eng-review.
> Status: CEO + ENG CLEARED — ready to implement. Run /plan-design-review before building UI screens.

---

## Problem Statement

Devout believers in Vedic astrology (mid-30s to 50s) currently rely on human astrologers
for personalized, contextual guidance on major life decisions. Existing apps (AstroSage,
Astrotalk, etc.) generate one-shot reports or connect users to marketplace astrologers —
but none build a persistent, memory-based relationship. The human astrologer remembers
your history, tracks their predictions, and deepens their model of you over years. No app
does this. The result: devout believers use apps for convenience but keep their human
astrologer for anything that matters.

---

## Demand Evidence

- Vedic astrology holds >60% share of India's $1.16B astrology app market (2025)
- Astrotalk: $77M revenue, IPO-bound — proves willingness to pay for ongoing astrology access
- Devout believers already pay human astrologers (ongoing cost) — proven spending behavior
- Key user pain points with existing apps: no memory, no relationship, everything behind a paywall, charts too small to read, no explanation of reasoning

**Internal pitch angle:** $1.16B market at 9.28% CAGR. Astrotalk's IPO validates the revenue model. No incumbent has shipped persistent memory + Vedic — first-mover window is now, before AstroSage's Bhrigoo.ai matures.

---

## Target User

**"Priya Sharma" archetype** — devout believer, 35-50, urban/semi-urban India or diaspora. Grew up with family astrologer. Currently pays ₹1000-3000/session for human consultations. Has a smartphone, uses apps but doesn't fully trust them. What keeps her up at night: "Am I making the right decision about [marriage / job / health]? What does my Kundali say about this year?"

---

## Key Insight (EUREKA)

> Everyone builds astrology apps as one-shot report generators. But a devout believer doesn't want a report — they want a **relationship**. No existing app has memory. Your astrologer remembers what they predicted last year, tracks whether it came true, and builds a model of your life over time. That's what no app does.

The real moat is *prediction accuracy tracking + memory*. JyotishHardev's distinguishing claim isn't "I remember you" — it's "I have a 4/5 track record with you, and here's the evidence."

A second EUREKA: **everyone builds for the seeker, nobody builds for the astrologer**. If JyotishHardev becomes the tool human astrologers use to manage clients, the astrologer brings their existing 50-500 clients. Competitors become your distribution channel.

---

## Approach: B with C as the wedge

Three approaches were evaluated:

| Approach | Summary | Decision |
|----------|---------|----------|
| A: Report Generator | One-shot Kundali report | Rejected — commoditized, no moat |
| B: Persistent Astrologer | AI with memory, event tracking, accuracy score | **Chosen — 9/10** |
| C: Milestone Oracle | Best-in-class milestone prediction, one screen | Ship first as acquisition hook |

**Strategy:** Ship the Milestone Oracle (C) first — one screen, shareable, demoed in 60 seconds. Then build the persistent memory layer (B) on top.

---

## Phased Architecture

```
PHASE 1 (weeks 1-6)              PHASE 1.5 (weeks 7-10)       PHASE 2 (months 3-6)
─────────────────────            ──────────────────────        ──────────────────────────────
Milestone Oracle (wedge)  ──▶   Accuracy dashboard    ──▶    Astrologer CRM (B2B)
+ Persistent chat         ──▶   Disconfirm flow        ──▶    Family Kundali graph
+ Accuracy data stub      ──▶   Hindi v1.1             ──▶    Hindi full localization
+ Daily ritual layer                                           (API licensing — DEFERRED)
+ Subscription billing
```

**Phase 1 scope note:** Accuracy Engine in Phase 1 = data collection only (background aggregation, no UI). User can log Events but sees no accuracy stats yet. Accuracy dashboard ships in Phase 1.5 once corpus has meaningful data (target: 500+ Events).

---

## Core Screens

### 1. Onboarding (5 steps, one question per screen)

Sequence: POB → DOB → TOB → Tradition → DPDPA consent.
Each step is a single full-screen card — no multi-field forms.

```
STEP 1 — Place of Birth
  PRIMARY:   City search input (Google Places autocomplete), large
  SECONDARY: "Where you were born determines your rising sign" (1-line microcopy)
  TERTIARY:  Progress indicator (1/5)

STEP 2 — Date of Birth
  PRIMARY:   Native date picker (scroll wheel, not calendar grid)
  SECONDARY: "Your birth date shapes your planetary periods"
  TERTIARY:  Progress indicator (2/5)

STEP 3 — Time of Birth
  PRIMARY:   AM/PM time picker (hour + minute scroll)
  SECONDARY: "Don't know your exact time? We'll use noon and note the uncertainty."
             [I don't know my birth time] — prominent secondary button, not hidden
  TERTIARY:  Progress indicator (3/5)

STEP 4 — Tradition
  PRIMARY:   Two cards: [Parashara] [Jaimini]
             Parashara: "The most widely practiced system — your astrologer likely uses this"
             Jaimini: "An advanced system — ask your astrologer before choosing"
  SECONDARY: "This choice is permanent — you can't change it later."
             (Warning shown clearly, not buried in fine print)
  TERTIARY:  Progress indicator (4/5)

STEP 5 — DPDPA Consent
  PRIMARY:   What we store and why (3 bullets, plain language — not legalese)
  SECONDARY: Checkbox: "I consent to JyotishHardev storing my birth details and
             reading history as described above."
  TERTIARY:  Link to full privacy policy. Progress indicator (5/5).
             [Generate my Kundali] CTA — blocked until checkbox checked.
```

**Transition after step 5:** Full-screen "Computing your Kundali" state — not a spinner, a moment. Show the planets being placed. Duration ~3-5s. This is the sacred moment; don't rush it with a loading bar.

---

### 2. Dashboard

```
┌─────────────────────────────┐
│  Kanya Lagna · Vrishchika 🌙 │  ← identity strip (always visible, small)
├─────────────────────────────┤
│                             │
│   YOUR LIFE TIMELINE        │  ← PRIMARY (hero)
│   ━━━━━━━━━━━━━━━━━━━━━━━  │
│   2025 ▓▓▓▓▓░ Career shift │     tap → detail sheet
│   2027 ▓▓▓░░░ Relationship │     confidence bar = strength of indication
│   2029 ▓▓▓▓▓▓ Peak period  │
│   [See full timeline →]     │
│                             │
│   [Kundali chart — smaller] │  ← SECONDARY (collapsible)
│   South Indian 4×4 grid     │     tap → full-screen chart view
│                             │
├─────────────────────────────┤
│  💬 Ask your astrologer...  │  ← pinned bottom CTA (always visible)
└─────────────────────────────┘
```

Navigation: bottom tab bar — Dashboard | Conversation | Events | Account.

---

### 3. Conversation

```
┌─────────────────────────────┐
│  🧠 Remembers 14 sessions   │  ← trust strip (top, always visible)
│     Last: 3 days ago        │
├─────────────────────────────┤
│                             │
│   [chat messages]           │  ← PRIMARY (scrollable)
│                             │
│   Memory tag on AI response:│
│   ┌─────────────────────┐   │
│   │ 💡 Based on: your   │   │  ← tappable chip on each AI response
│   │  Jupiter Mahadasha  │   │     reveals: which session/prediction informed this
│   │  + 2 sessions ago   │   │
│   └─────────────────────┘   │
│                             │
├─────────────────────────────┤
│  Trial: 3/5 msgs today      │  ← rate limit bar (trial users only)
│  [Upgrade for unlimited]    │     hidden for paid users
├─────────────────────────────┤
│  [Type a message...]  [→]   │  ← input, always visible
└─────────────────────────────┘
```

Event logging: float button "✓ Something happened" → bottom sheet to log a life event. Does not interrupt the chat flow.

---

### 4. Share Page (`/share/:id`) — the viral wedge

```
┌─────────────────────────────┐
│  ✨ Priya's Life Timeline   │  ← first name only (no last name, no birth details)
│     Generated by JyotishHardev│
├─────────────────────────────┤
│                             │
│   2025 ▓▓▓▓▓░ Career shift │  ← Same visual as dashboard timeline
│   2027 ▓▓▓░░░ Relationship │     but static (no interaction)
│   2029 ▓▓▓▓▓▓ Peak period  │
│   2031 ▓▓▓░░░ Health watch │
│                             │
│   "This is based on Vedic   │  ← 1-sentence disclaimer, small
│    planetary positions —    │
│    not a guarantee."        │
│                             │
├─────────────────────────────┤
│  [Get your own timeline →]  │  ← PRIMARY CTA — links to onboarding
│  Free · No account needed   │     subtext kills friction
└─────────────────────────────┘
```

Privacy: first name only on share page. No birth date, no birth time, no location visible. User controls what they share (default: first name + timeline only).

---

## Interaction States

### Kundali Generation (post-onboarding)

**Loading:** Planetary animation — each planet placed one by one with name.
"Placing Sun in Kanya... Moon placed: Vrishchika ✓... Placing Mars..." Subtle warm glow background. ~3-5s. Never skip or rush this — it earns trust.
**Success:** Transition directly to Dashboard. No intermediate "Your Kundali is ready!" screen — just arrive.
**Error (pyswisseph fails):** "We hit a snag computing your chart. Your details are saved — tap to try again." Pre-filled form, not a blank retry. Max 2 auto-retries before showing this.

### Dashboard

| Feature | Loading | Empty | Error | Success |
|---------|---------|-------|-------|---------|
| Timeline | Skeleton bars (3 rows, shimmer) | — (never empty — always has predictions) | "Timeline unavailable — tap to reload" | Milestone rows with confidence bars |
| Kundali chart | Grey 4×4 grid skeleton | — (never empty) | "Chart unavailable" + retry | South Indian chart with house contents |
| Chat CTA | — | — | — | Always visible, pinned bottom |

### Conversation

| Feature | Loading | Empty (first session) | Error | Success |
|---------|---------|----------------------|-------|---------|
| Chat history | Shimmer bubbles | **"This is your first session. Ask me anything about your chart, your year ahead, or what's on your mind."** — warm, not "No messages yet." | "Couldn't load history" + retry | Message list |
| AI response | Typing indicator (3 dots) | — | "I couldn't generate a response. Please try again." (never show raw error) | Response with memory tag chip |
| Rate limit hit | — | — | Inline: "You've used your 5 messages for today. [Upgrade for unlimited →]" — not a modal | — |
| Memory tag | — | — | Hide tag silently if memory retrieval fails | 💡 chip on AI message |
| Trial day 25 | — | — | — | Soft banner in chat header: "5 days left in your trial · [Continue your journey →]" |
| Trial expired | — | — | — | Chat input disabled. Overlay: "Your trial has ended — your chart and timeline are yours forever. [Upgrade to continue →]" |

### Onboarding

| Step | Loading | Error | Edge case |
|------|---------|-------|-----------|
| POB autocomplete | Inline spinner in input | "Location not found — try a nearby city" | City name ambiguous → disambiguation list |
| Chart generation | Planetary animation (see above) | Pre-filled retry prompt | — |
| DPDPA checkbox | — | Checkbox required — CTA stays disabled, subtle shake animation | — |
| TOB unknown | — | — | "I don't know" tapped → confirm dialog: "We'll use noon as your birth time and note the uncertainty on your chart." |

### Share Page

| State | What user sees |
|-------|----------------|
| Loading | Skeleton timeline bars (SSR should eliminate this — fallback only) |
| Valid share link | Timeline + first name + "Get your own" CTA |
| Expired/invalid link | "This timeline has been removed. Generate your own →" — never a 404 |
| No-JS fallback | Full timeline rendered in HTML (SSR — always works) |

---

## Entity Model

| Entity | Key fields | Notes |
|--------|-----------|-------|
| Profile | user_id, name, dob, tob, pob, tradition (parashara/jaimini), lagna, moon_sign, trial_expires_at, schema_version | One per user |
| Kundali | profile_id, chart_json, dasha_timeline_json, created_at, schema_version | Computed at onboarding, never changes |
| Prediction | id, profile_id, dasha_period, domain (career/health/etc), predicted_year_range, text, confidence_score | Generated at onboarding; refreshed annually |
| Event | id, profile_id, type (career/marriage/health/etc), date, description, confirms_prediction_id | Logged by user |
| SessionMemory | id, profile_id, session_date, summary_text, predictions_made[], events_logged[], embedding | Rolling summary; max 20 stored; oldest pruned |
| FamilyLink | id, primary_profile_id, linked_profile_id, relationship | Phase 2; invitation-only |
| AccuracyCorpus | prediction_domain, dasha_period, confirmed_count, total_count | Anonymized aggregate; disconfirm flow deferred to Phase 1.5 |

---

## Feature Boundary (Free vs Paid)

| Feature | Free (30-day trial then blocked) | Paid ₹199/month |
|---------|----------------------------------|-----------------|
| Kundali generation | ✅ Forever free | — |
| Milestone Oracle timeline | ✅ Forever free + shareable | — |
| Persistent chat (25 msgs/day) | ✅ During trial (5/day) | ✅ |
| Daily transit + ritual push | ✅ During trial | ✅ |
| Accuracy dashboard | ❌ (ships Phase 1.5) | ✅ |
| Jaimini chart option | ❌ | ✅ |
| Family Kundali (Phase 2) | ❌ | ✅ (up to 5 members) |

**Trial expiry UX:** Chat history preserved. Chart and Milestone Oracle permanently free. Chat locked.

**Upgrade screen copy (loss-first framing):**
> "Your chart and timeline are yours forever.
> To continue your conversation with Hardev, upgrade for ₹199/month."
> [Continue with Hardev →]   [Maybe later]

CTA label is "Continue with Hardev" — not "Upgrade" or "Subscribe". Preserves the relationship framing.

**Tradition warning (onboarding step 4):** Dedicated warning card before the two choice cards. "⚠️ This choice is permanent. You won't be able to change it later." Parashara card labelled "(recommended) — your astrologer likely uses this system." Jaimini card labelled "(advanced) — ask your astrologer before choosing this."

## Design System

### Colour Palette

```
Background:  #F5F0E8  (warm cream — app background)
Surface:     #FFFFFF  (cards, chat messages)
Primary:     #1B1F4A  (deep indigo — headers, primary actions, trust strip)
Accent:      #C9A84C  (temple gold — confidence bars, accents, highlights)
Text:        #1A1A2E  (near-black — body copy)
Muted:       #6B6B8A  (soft indigo-grey — secondary text, placeholders)
Error:       #C0392B  (deep red — errors only, never decorative)
Success:     #27AE60  (confirmation green — event confirmed, payment success)
```

Rationale: Indigo + gold evokes the night sky, sacred manuscripts, and temple gold — not the saffron of every competitor. Warm cream background feels like aged parchment rather than clinical white.

### Typography

```
Headings:    Tiro Devanagari (Google Fonts) — serif, evokes classical scripts
             Falls back to: Georgia, serif
Body:        Inter — clean, highly readable at small sizes
             Falls back to: -apple-system, sans-serif
Monospace:   Not used in UI (backend only)
```

Scale (4px base unit):
- xs: 12px  |  sm: 14px  |  md: 16px  |  lg: 20px  |  xl: 24px  |  2xl: 32px

### Spacing Scale

4px base unit: 4, 8, 12, 16, 24, 32, 48, 64px. Nothing outside this scale.

### Component Tokens

```
Border radius:   12px cards, 24px pills/buttons, 4px chips
Shadow:          0 2px 8px rgba(27,31,74,0.08)  — indigo-tinted, not grey
Transition:      200ms ease — fast, not sluggish
Touch target:    Minimum 44×44px (all interactive elements)
```

### Icons

Use Phosphor Icons (consistent weight, good Devanagari-adjacent aesthetic).
Domain icons: ⚡ career, ❤ relationship, 🌿 health, 💰 finance, 🏠 family.
AI avatar: ⊕ (planetary symbol) — never a face, never a robot emoji.

---

## Visual Differentiation (Anti-Slop Rules)

JyotishHardev must not look like ChatGPT with a saffron color scheme. Specific decisions:

**Chat screen — Astrologer persona:**
- The AI has a name: **Hardev** (the astrologer persona)
- Avatar: abstract planetary symbol (⊕ or similar) — not a face, not a robot
- AI responses styled as letters/correspondence — bordered cards, not rounded bubbles
- Memory tags appear as small stamped seals (🕐 icon + session reference) inside the response card — not external chips
- User messages: clean right-aligned bubbles (standard — contrast with the astrologer's formal cards)

**Kundali chart:**
- South Indian 4×4 grid is the non-negotiable format — do NOT substitute North Indian diamond grid
- House numbers in traditional style — not modern numbered squares
- Planet abbreviations in Sanskrit (Su, Mo, Ma, Bu, Gu, Sk, Sa, Ra, Ke) — not English

**Milestone timeline:**
- Confidence bars use a warm earth-tone fill — not a generic blue progress bar
- Each milestone row has a domain icon (career ⚡, relationship ❤, health 🌿, finance 💰, family 🏠)
- Year label left-aligned, domain right, confidence bar between

**Typography principle:** Headings in a serif that evokes classical Indian manuscripts (Tiro Devanagari or similar). Body text in a clean sans-serif for readability. Never use a generic system font for headings.

**What NOT to do:**
- No hero section with "Your personal AI astrologer" headline
- No 3-column feature cards
- No generic gradient backgrounds
- No saffron/orange as primary brand color (every competitor uses it)
- No star/sparkle emoji in UI chrome

---

## Technical Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Ephemeris | `pyswisseph` (Python) | Mathematical precision required; NOT LLM-generated |
| Dasha calculation | Vimshottari (Parashara default), Chara (Jaimini) | Jaimini requires ~1 extra week of custom logic |
| LLM (interpretation) | Claude API | System prompt = Kundali JSON + top-5 relevant session summaries |
| Session memory | PostgreSQL + pgvector | Cosine similarity on SessionMemory.summary_text embeddings |
| Backend API | FastAPI (Python) | Matches ephemeris library language; REST |
| Mobile | React Native | South Indian chart grid |
| Share page | Next.js | Server-rendered, no login required, shareable URL |
| Payments | Razorpay (India) + Stripe (non-India) | UPI AutoPay e-mandate: start NPCI approval immediately (2-4 week lead time) |
| Auth | Supabase Auth | Email + password; JWT; row-level security |
| Push notifications | Expo Notifications | Wraps FCM/APNs; fallback to email digest |
| Deployment | Railway or Render | FastAPI backend |

### LLM Memory Architecture

```
Sessions 1-3:  All sessions injected directly into prompt (no vector search)
Session 4+:    pgvector cosine similarity → top-5 most relevant SessionMemory summaries

System prompt structure:
  [Kundali JSON]
  [Top-5 session summaries]
  [Current conversation]
```

Cold-start handled: no embedding retrieval until session 4.

### Prediction Generation

- Generated once at onboarding (batch for all Dasha periods in user's lifetime)
- Refreshed on each annual transit cycle
- LLM interprets pre-computed Dasha timeline; does NOT generate planetary positions
- Stored in DB, not generated per-request

### Response Classifier

All LLM responses pass through a classifier before reaching the user:
- Rewrites death framing → "health watch period — prioritize preventive care"
- If classifier errors → fallback message shown, never raw unclassified response

---

## Resolved Decisions

1. **Vedic tradition:** Both Parashara + Jaimini — user selects at onboarding. Default: Parashara. Choice is **permanent** (note shown at onboarding). Jaimini requires extra engineering scope — treat as separate task.
2. **Monetization:** 30-day free trial → ₹199/month. B2B (Astrologer CRM): ₹1999/month per practice.
3. **Language:** English at launch. Hindi in v1.1 (within 60 days of launch).
4. **Sponsor strategy:** Demo-first. Build the Milestone Oracle, then pitch internally. Target: whoever owns the India/South Asian audience segment.
5. **Onboarding sequence** (reviewer concern — define before build): POB → DOB → TOB (AM/PM picker) → tradition → DPDPA consent.
6. **Unknown time of birth:** Graceful fallback to noon chart with disclaimer.

---

## Expanded Scope (CEO Review additions)

### Phase 1
- **Crowdsourced Accuracy Engine:** User taps "this happened" on a Prediction → increments `AccuracyCorpus.confirmed_count`. Phase 1 = data collection only; no UI. Dashboard in Phase 1.5 after 500+ Events.
- **Daily Ritual Layer:** Personalized daily transit + remedy push notification. Subscription paywall trigger.

### Phase 2
- **Astrologer CRM:** B2B tool for human astrologers to manage clients in JyotishHardev. Turns competitors into distribution. ₹1999/month.
- **Family Kundali Graph:** Link up to 5 family members. Each member independently consents via OTP invite. DPDPA 2023 compliance required.

### Deferred to TODOS
- API licensing / platform play (let other apps plug into the memory layer)
- Gemstone / physical product recommendations
- iOS + Android native chart interactions (zoom, tap-to-explain house)

---

## 12-Month Vision

```
CURRENT STATE                THIS PLAN (Phase 1)          12-MONTH IDEAL (Phase 1+2)
─────────────────            ────────────────────         ──────────────────────────────
Human astrologer             AI astrologer with           Platform: seekers + astrologers
(₹1000-3000/session,    --> memory + milestone   -->     + families. Network effects.
trust earned over years)     predictor + daily ritual     ₹199/mo B2C + ₹1999/mo B2B.
                                                         Crowdsourced accuracy = moat.
```

**Platonic ideal (5-year):** A family heirloom. Grandmother adds her Kundali. Her daughter's is linked. Granddaughter's added at birth. Three generations of life events, prediction accuracies, family karma patterns. No human astrologer can offer that.

---

## Phase 1 Success Criteria (Go/No-Go for Phase 2)

1. Milestone Oracle shared ≥500 times in first 2 weeks (virality check)
2. D30 retention ≥ 40% (memory layer delivering value)
3. Trial → paid conversion ≥ 8%
4. At least 1 astrologer reaches out asking to use the platform (B2B signal)

**Phase 1.5 gate:** 500+ confirmed Events in AccuracyCorpus before accuracy dashboard ships.

---

## Milestone Prediction Framing

| Raw prediction | User-facing language |
|---|---|
| Death year indication | "Health watch period — prioritize preventive care" |
| Marriage Dasha active | "Strong relationship window — 2027–2029" |
| Hard prediction year | "High-intensity year — career shift or significant change" |

Show confidence (%) based on how many planetary factors align.

---

## Key Routes

- `/onboarding` — birth details form, DPDPA consent, Google Places POB autocomplete, chart generation
- `/dashboard` — Kundali chart, milestone timeline, chat entry
- `/share/:id` — Next.js server-rendered Milestone Oracle share page (no login required)
- `/conversation` — persistent chat, memory tags, rate limit, trial upgrade CTA
- `/events` — event logging, confirms_prediction_id linking, AccuracyCorpus increment
- `/subscription` — Razorpay (India) / Stripe (non-India) routing, trial → paid upgrade
- `/account/delete` — DPDPA data deletion endpoint

---

## Open Reviewer Concerns (address before build)

1. **Onboarding screen sequence** — defined above: POB → DOB → TOB → tradition → DPDPA consent.
2. **Phase 1.5 success gate** — defined above: 500+ confirmed Events.
3. **Razorpay lead time** — UPI AutoPay e-mandate requires NPCI approval (2-4 weeks). Start immediately. Stripe fallback while pending (separate webhook handler + user routing logic — budget 1 extra week).

---

## Responsive & Accessibility

### Mobile app (React Native)

**Kundali chart on small screens:** Fixed minimum 320×320px, horizontal scroll if viewport < 320px. Never distort the 4×4 grid layout — Priya recognises the authentic South Indian format. Tap chart → full-screen modal with pinch-to-zoom + pan.

**Share page responsive breakpoints (Next.js):**
```
Mobile  (<640px):  Single column. Timeline full-width. CTA full-width sticky bottom.
Tablet  (640-1024): Timeline centered, max-width 480px. CTA below.
Desktop (>1024px): Timeline centered, max-width 600px. CTA below.
                   No sidebar — this is a single-purpose page, not a layout.
```

**Touch targets:** All interactive elements minimum 44×44px (Apple HIG + WCAG 2.5.5). Milestone rows, memory tag chips, event confirm buttons — all must meet this minimum.

### Accessibility (WCAG 2.1 AA minimum)

**Colour contrast:**
- Indigo (#1B1F4A) on cream (#F5F0E8): 12.1:1 ✓ (exceeds AAA)
- Gold (#C9A84C) on white (#FFFFFF): 2.9:1 ✗ — **never use gold for text**. Gold is decorative/fill only.
- All body text: minimum 4.5:1 contrast ratio

**Screen reader support:**
- Kundali chart: each house labelled with aria-label "House N: [planet names]"
- Milestone timeline: each row announced as "[domain] — [year range] — [confidence]% confidence"
- Memory tag chips: announced as "Based on session from [date]"
- Rate limit counter: aria-live="polite" so screen readers announce changes

**Keyboard navigation (share page / web):**
- Tab order: logo → timeline rows → CTA button
- Timeline rows: focusable, Enter/Space expands detail
- Skip-to-content link as first element

**Text size:** Body minimum 16px. No text below 12px in any state (including memory tags and rate limit counter).

**Reduced motion:** Planetary animation respects `prefers-reduced-motion`. Fallback: simple progress bar.

---

## User Journey & Emotional Arc

Priya's journey through JyotishHardev. Design every screen to serve the emotion at that moment — not just the function.

```
STEP           USER DOES                  USER FEELS              DESIGN SERVES
─────────────────────────────────────────────────────────────────────────────────
Discovers      Taps a shared timeline     Curious, slightly       Share page: warm, personal
               (someone sent her link)    sceptical               ("Priya's Life Timeline")
                                                                   CTA: "Free · No account needed"
                                                                   — removes every barrier

Onboarding 1   Enters city of birth       Cautious — this is      Microcopy: "Where you were born
(POB)                                     personal information    determines your rising sign"
                                                                   — explains WHY before asking

Onboarding 2-3 Enters date + time         Opening up              Progress bar shows nearness to
(DOB/TOB)      of birth                                           reward. "I don't know" is
                                                                   prominent — no shame in not knowing

Onboarding 4   Chooses tradition          Uncertain               Parashara card reads:
(Tradition)                                                        "Your astrologer likely uses this"
                                                                   — anchors to her trusted reference

Onboarding 5   Reads DPDPA, taps consent  Vulnerable, needs       Plain language. 3 bullets.
                                          reassurance             No legalese. No hidden text.

Kundali gen    Watches planets being      Anticipation, awe       Planetary animation — slow,
               placed one by one                                   deliberate. This is a ritual.
                                                                   Don't rush it.

First dashboard Sees her timeline         "Oh." — the moment      Timeline is the hero.
                                          of recognition          First milestone she sees should
                                                                   be the current year or near future.
                                                                   Make it immediately relevant.

First session  Types her first question   Tentative               Empty state is warm and inviting:
(Conversation)                                                     "Ask me anything about your chart,
                                                                   your year ahead, or what's on
                                                                   your mind."

Session 3+     Returns, asks again        Building trust          "Remembers N sessions" strip is
                                                                   now a point of pride, not just info.
                                                                   Accuracy score appears if events
                                                                   have been logged.

Event logged   Taps "this happened"       Satisfaction, proof     Confirmation: "Logged ✓ — this
               on a confirmed prediction                           helps build your accuracy score."
                                                                   Never sterile. Always warm.

Trial day 25   Sees upgrade CTA           Low-grade anxiety       Soft banner, not a modal.
                                                                   "5 days left — your history
                                                                   stays safe either way."

Trial expiry   Chat locked                Loss, but not           "Your chart and timeline are
                                          abandoned               yours forever." — immediately
                                                                   reassure before the upgrade ask.
```

**5-second visceral:** "This app feels like it was made for me, not for everyone."
**5-minute behavioral:** "I found out something real about my year. I want to know more."
**5-year reflective:** "This has been with me through every major decision. It knows me."

---

## Before Writing Code

Find and sit with one devout believer — family member, friend, or colleague — and ask:
> "Can you walk me through the last time you consulted an astrologer? What did you ask, what did they tell you, and how did it change what you did?"

And specifically: "Would you use an app that remembered everything your astrologer has ever told you?"

That conversation will tell you more than this document.

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | CLEAR | 5 proposals, 5 accepted, 0 deferred |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR | 14 issues, 1 critical gap (accepted) |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | CLEAR | score: 3/10 → 9/10, 8 decisions made |

- **UNRESOLVED:** 0 decisions unresolved across all reviews
- **VERDICT:** CEO + ENG + DESIGN CLEARED — ready to implement.
