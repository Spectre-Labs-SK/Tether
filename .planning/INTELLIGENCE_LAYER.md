> **Status:** FOUNDATIONAL. This reframes MVP scope. Do not spec anything without reading this first.
> 

---

# The Insight

Tether's core value is not the fitness tracker, the cooking module, or the themes.

**Tether's core value is that it sees the pattern before the user does.**

The surface (SOS, modules, themes, drops) is the delivery mechanism. The intelligence layer reading receipts, spend patterns, grocery shifts, and purchase frequency — and surfacing a warning before the user consciously registers anything is wrong — **that is the product.**

---

# The Canonical Example (PTSD)

> *"I've had PTSD since 2019. I figured out this year that I know a crash is coming because I start getting coffee from Tim Hortons more."*
> 

> — Cade, 2026-05-08
> 

The user doesn't think "I'm stressed." They just find themselves at Tims at 7am three days in a row. The app sees it before they do. It doesn't wait for a journal entry, a flag, or a mood check-in. The data is already there in the receipts.

This works specifically for PTSD, ADHD, and depression because:

- Symptoms appear in **behaviour before awareness**
- Self-reporting is unreliable during pre-crash states
- The signals are in the data, not in the self-assessment
- External pattern recognition fills the gap the brain can't fill for itself

---

# The Intelligence Layer — What It Actually Is

## 1. Info Dump Ingestion

User dumps a mix of:

- Receipts (photos)
- Bank account screenshots
- Images of purchases
- Any financial/purchase documentation

App sorts, categorizes, and indexes automatically. No manual entry required.

## 2. Finance Tracker

- Transaction categorization from the dump
- Recurring pattern tracking (frequency, vendor, amount, time of day)
- Cross-household sync
- Budget awareness (not budgeting — *awareness*)

## 3. Pantry Use Tracker

- What they're buying vs. what they usually buy
- Frequency shifts (more drive-through, less grocery)
- Substitution patterns (cheaper items, different categories)
- Auto-updates shared household lists based on purchase data

## 4. Pendulum Warnings

- App detects drift from baseline behaviour patterns
- Surfaces a warning **before** the user consciously notices
- Framing: not alarming, not clinical — just: *"Hey. We noticed something. You okay?"*
- The Tim Hortons example: frequency up 40% → pendulum warning fires
- These are the highest-value NoseyQuestions outputs

## 5. Household Sync & Auto-List Updates

- Shared household members see list changes based on actual purchase data
- "The pantry tracker noticed you're low on X" type of auto-update
- Reduces the coordination overhead between household members

---

# What This Means for MVP

**Previous MVP thinking:** SOS + Cooking + Fitness + 2 themes.

**Revised:** Without the intelligence layer, Tether is a recipe app with a nice theme system. The value that makes people stay, refer friends, and pay — is the pendulum warning. That requires:

| Layer | MVP Requirement |
| --- | --- |
| Info dump ingestion | Receipt + screenshot → categorized transaction |
| Finance pattern tracking | Baseline → drift detection |
| Pantry tracking | Purchase frequency by category |
| Pendulum warning system | Alert before conscious awareness |
| Household list sync | Auto-update from real purchase data |

The SOS + Cooking flow is still the **entry point** — it gets them to trust the app in 20 minutes. But the intelligence layer is what makes them **stay and pay**.

---

# Design Implications

- ML training starts on **day 1 from the info dump**, not from in-app behaviour alone
- Baseline is established faster with financial data than with session data
- Pendulum warnings must be **non-clinical in language** — this is not a diagnostic tool
- The user should feel *seen*, not surveilled
- The Tims moment should feel like a perceptive friend noticed, not like an algorithm flagged them

---

# Open Questions

- [ ]  What is the minimum viable info dump? (Photo only? PDF? Direct bank connect?)
- [ ]  How do we handle bank screenshot parsing without Plaid/open banking?
- [ ]  What is the baseline period before pendulum warnings can fire? (2 weeks? 30 days?)
- [ ]  How do pendulum warnings interact with the NoseyQuestions system?
- [ ]  What's the framing/copy for a pendulum warning — who is "speaking"?
- [ ]  Does the pendulum warning go to the user only, or to a Joint Ops partner too?
- [ ]  Privacy architecture — receipts and bank data need explicit consent framing

---

*Logged by Claude — 2026-05-08. Source: Cade session — product reframe conversation.*