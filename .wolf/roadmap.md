## Planned (not yet built)
.planning/BUILD_PLAN.md     — phased roadmap
src/modules/finance/        — finance + pantry module
src/modules/cooking/        — SOS cooking flow
src/intelligence/           — behavioral pattern layer
supabase/migrations/007_*   — noseyquestions_log
supabase/migrations/008_*   — accounts + transactions + envelopes

# Tether — Build Roadmap
*Read this before starting any feature work. Check current phase. Do not build ahead.*

---

## Current Phase: 0 — LEVEL 0: BUNKER RECONSTRUCTION
**Execution implemented; Android human UAT pending. Do not start Phase 1 tasks until the Level 0 fun loop is proven.**

---

## Phase 0 — Level 0: Bunker Reconstruction
**Timeline:** 3 weeks for first fun vertical slice
**Goal:** Prove the core loop: real household actions rebuild a destroyed base while chaos attacks it.

**GSD phase directory:** `.planning/phases/00-level-0-bunker-reconstruction/`

**GSD plans:**
- `00-01-PLAN.md` — product/spec consolidation and missing source docs
- `00-02-PLAN.md` — behavior-event model, screenshot ingestion, wipe data, kill switch stub, migrations
- `00-03-PLAN.md` — native Level 0 Bunker vertical slice
- `00-04-PLAN.md` — Joint Ops/Ghost Ops fitness framing without hardcoded workouts

### Level 0 Working Name
**Bunker Reconstruction**

### Theme Modes
- **Military:** destroyed tactical bunker, amber/green terminal, debris, gear rack, sealed blast doors.
- **Ethereal:** ruined prism sanctuary, overgrown machinery, strange light, glyph doors.
- **Both / Mixed:** roots through concrete, prism light through dust, tactical salvage becoming alive.

### Fun Law
This cannot be cozy productivity. Parenting, bills, groceries, toddlers, teenagers, sleep debt, and household overload are often not light or inspirational. Tether makes the chaos playable: the base is under attack, you and your partner rebuild/defend it, and every real action changes the world.

### Checklist
- [x] Create `Level0BunkerReconstruction` vertical slice from the pasted mockup direction
- [x] Military / Ethereal / Mixed Level 0 visual modes
- [x] Silent degradation states — dimmer, dirtier, quieter; no shame warnings
- [x] Task completion changes the scene physically
- [x] Locked door visible before unlock
- [x] One earned Intel Drop: `// INTEL RECOVERED`
- [x] One household chaos/base-attack event
- [x] Behavior events logged for completion, skip, substitute, shuffle, defer, and event response
- [x] Centralize `RootStackParamList` → `src/native/navigation.types.ts`
- [x] Write `data-model.md` — behavior_events, question_sessions, generated_plans, plan_steps, plan_actions, accounts, transactions, envelopes, pantry_items, pendulum_events, noseyquestions_log
- [ ] Build wipe data button — real, working, first feature shipped
- [x] Kill switch stub — hardcoded logic, doesn't need to fire yet, needs to exist
- [ ] Push repo public to GitHub
- [x] Screenshot ingestion pipeline — image uploaded → stored, not parsed yet
- [x] Decide: Android or iOS first (affects all Expo build targets)
- [x] Migration 08 — behavior_events + question_sessions
- [x] Migration 09 — generated_plans + plan_steps + plan_actions

### Rules While in Phase 0
- UI work is allowed only for the Level 0 fun loop and trust-critical controls
- Theme work is allowed only for Military / Ethereal / Mixed Level 0
- No hardcoded fitness onboarding
- No avatar/armor-drop economy unless it directly improves the base reconstruction loop
- Data model decisions go in `cerebrum.md` before any migration is written

---

## Phase 1 — MVP
**Timeline:** Months 1–4
**Goal:** One real person. One real problem. Solved in under 20 minutes.
**The bar:** Overwhelmed parent, 4 hungry kids, payday Thursday. Opens app. Has supper on the table and a grocery list updated 20 minutes later. Trusts the app.

### Checklist
- [ ] SOS entry screen — split design, F*CK onboarding button, module picker, screen goes dark
- [ ] Cooking SOS flow — 3 AI questions → 3 options → sub every step → 1-step-at-a-time → music at 5 min → 20-min cap
- [ ] Shuffle logic — real shuffle, not biased. 3 sandwiches in a row is a bug.
- [ ] Name Generator
- [ ] House Name Generator
- [ ] Bunker — module-locked version (Cooking only, ~6 hours post-SOS)
- [ ] Theme choice screen — 3-screen selection, MILITARY + ETHER only
- [ ] Can I Afford This? v0 — user confirms balance manually, Tether returns yes/no/yes-but
- [ ] Safety Net envelope — first envelope, auto-suggested, user approves once
- [ ] Autodraft alert — night-before notification: "move $X to cover tomorrow's bill"
- [ ] NoseyQuestions v0 — opt-in, low frequency, static question bank, no ML
- [ ] Free 2-week trial — no credit card, download and go
- [ ] Chill onboarding flow — Name Gen → House Name → module choice → Bunker → theme

### Rules While in Phase 1
- One module (Cooking). Do not add Fitness, Finances, or Calendar yet.
- Can I Afford This? does not need OCR. User types the balance. That's fine.
- NoseyQuestions is opt-in only. Wrong timing twice = uninstall.
- MILITARY and ETHER themes only. Do not design new themes.
- No hidden themes. No drop system. No reveal mechanic.

---

## Phase 2 — V1
**Timeline:** Months 4–12
**Goal:** The Paw Patrol moment. User screenshots "Yes, but pasta this weekend — list updated" and sends it to three people. That's how this spreads.

### Checklist
- [ ] Screenshot OCR → account type inference (colors, fonts, amounts → 90% accuracy target)
- [ ] Finance intelligence layer — transaction pattern detection, biweekly income recognition
- [ ] Autodraft calendar — bills mapped, night-before alerts automated
- [ ] Pantry tracker — receipt-based + manual. Velocity learning starts here.
- [ ] Can I Afford This? v1 — integrated with pantry + grocery list. Cascade updates.
- [ ] Grocery list auto-generation — meal plan → list. Yes-but fires → list adjusts.
- [ ] Pendulum warnings v0 — rule-based (not ML). Psych-reviewed language mandatory before shipping.
- [ ] Debt snowball tracking — smallest balance first, not highest interest
- [ ] Fitness module — 3 AI questions → AI-generated Week 1 → sub + skip everywhere
- [ ] Joint Ops v0 — two users, shared checkpoints, basic accountability
- [ ] 4 additional themes (6 total)
- [ ] MARAUDER — first hidden theme, manual trigger for beta only, no reveal video yet
- [ ] Psych advisor engaged — intervention language review before any mental health marketing

### Rules While in Phase 2
- Pendulum warnings do NOT ship without clinical language review
- The glitch/reveal mechanic is beta-only until Phase 3. Do not ship to general users.
- NoseyQuestions moves to ML-assisted timing only after 90 days of real user data
- Do not claim Tether "treats" or "helps" any condition in marketing copy — "designed with ADHD in mind" is the line

---

## Phase 3 — Growth
**Timeline:** Month 12–24+
**Gate:** Do not enter Phase 3 without — (1) psychologist on team, (2) subscription revenue, (3) 90+ days of real user data.

### Checklist
- [ ] ML behavioral intelligence — replace rule-based pendulum warnings with trained model
- [ ] Individual baseline model — population averages replaced by per-user patterns
- [ ] Seasonal pattern detection — April squirrelling, holiday anticipation, annual cycles
- [ ] Bipolar pre-episode detection — with psych. Clinically validated signal clusters.
- [ ] Dr. XX appointment booking — stored locally, never leaves device without consent
- [ ] DV pre-event detection — academic partnership, IRB process. Research project, not a feature sprint.
- [ ] Full theme system — 10+ levels, Dark/Ethereal/Mixed axes, morphing middle
- [ ] Hidden theme reveal sequence — glitch → 75% clue → 95% warning → crash → video → reveal
- [ ] 30-second reveal videos — production budget, real cinematics, not solo work
- [ ] Bunker → House → Farm progression — drop mechanics, what each unlock means
- [ ] A/B testing infrastructure — clinical validation, intervention timing, language testing

---

## Product Laws — Read Before Every Session

These do not change. If a task conflicts with one of these, stop and flag it.

1. **Tether's goal is to make itself unnecessary.** Build habit pathways, not dependency.
2. **No hardcoded workouts. Ever.** AI generates the program from questions.
3. **Sub button on every step.** Every ingredient. Every instruction. "Boil water" gets a sub.
4. **Shuffle is a real shuffle.** No algorithmic bias. 3 sandwiches in a row is a bug.
5. **20-minute SOS cap.** Hard cap. Not a guideline.
6. **3 questions max for onboarding.** The AI picks the highest-yield unknown.
7. **Wipe data button is real.** Full data wipe. Not archive. Test it.
8. **Kill switch is hardcoded.** Ad runs or anything is sold → everything wipes off every server.
9. **Never rebuild PushDayOnboarding.** Deleted intentionally. Do not recreate.
10. **Spec in Notion before writing code.** If the spec doesn't exist, write it first.
11. **Screenshots only. No direct bank access. Ever.**
12. **The app never judges a purchase.** Carter's, Tims, Paw Patrol — never flagged.

---

## The Intelligence Layer — What This Is

The surface (SOS, modules, themes) is the delivery mechanism.
The product is: **see the pattern before the user does. Offer a door, not a diagnosis.**

| Signal | Window | Intervention |
|---|---|---|
| Tims frequency up, grocery $0 | Days | "Hey. We noticed something. You okay?" |
| 4-behaviour cluster matching pre-hospital pattern | 2 weeks | "You haven't seen Dr. XX in a while. Want me to book it?" |
| DV pre-event pattern cluster | 2–3 days | "Your mom's in town. You have the gas money." |
| Engagement drop week 3 | Week 3 | Theme drop + novelty injection |
| April spend spike (year 2+) | February | Silent buffer squirrelling starts |

The app never says: "We think you're cycling." "You're overspending." "Consider cutting coffee."
The app says: "Want me to book that appointment?" "You've got $47 extra. Put it on the CC?"

---

## Feu Follet Charter — Non-Negotiable

- Data is the user's. Always.
- Screenshots give signal without identity. That's the model.
- Wipe button works. Really works.
- Code is public on GitHub. Transparency is the trust mechanism.
- Kill switch fires if: ads run, anything is sold in-app, data is shared with third parties.
- Business model: subscription only. Nothing else survives the kill switch.
- Language: "designed with ADHD in mind" — not "treats ADHD." Always.

---

*Last updated: 2026-05-08 — Cade session. Full session notes in Notion → Tether root.*
*Notion pages logged this session: Info Dump, Intelligence Layer, Feu Follet Charter, Mission Statement, Finance & Pantry Module Spec.*
