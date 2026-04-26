# NIGHT BUILD PHASE 2: AI FITNESS ENGINE & VALKYRIE ONBOARDING

**DOMAIN:** Core Application Flow & Fitness Engine
**AUTHOR:** TETHER_ARCHITECT
**STATUS:** ACTIVE

---

## 1. THE OBJECTIVE
We need to fully activate the Tether fitness tracking experience within our Vite Web App architecture. Currently, the `src/native/screens/` directory contains vestigial React Native code (`FitnessOnboardingGrid`, `PushDayOnboarding`, etc.). 

**Your mission:** Port these concepts into the active React DOM web architecture, wire up the AI "Bitch-Weight" and Cardio gates, and integrate the `VALKYRIE_MANIFEST` themes so the user is armed and ready for Joint Ops tomorrow.

---

## 2. EXECUTION STEPS

### STEP 1: Port the Fitness Onboarding Grid to Web
- Create `src/components/fitness/FitnessOnboardingGrid.tsx`.
- It must replace the vestigial React Native code with Tailwind-styled HTML (`div`, `button`).
- Replicate the "3-Taps-to-Active" flow: 
  - **Tap 1:** Select Domain (Iron, Road, Mat, Hub).
  - **Tap 2:** Select Activity (e.g., Push Day, 5K Interval).
  - **Tap 3:** Start Session.
- Maintain the industrial/tactical Spectre Labs aesthetic (dark backgrounds, monospace fonts, emerald/slate accents).

### STEP 2: Wire the "First Time Onboarding" Flow
- In `src/App.tsx` or `WarRoom.tsx`, check `profile.onboarding_pending` (from `useTetherState`).
- If a user is entering Full Mode (Chill Mode) for the first time, immediately route them to the `FitnessOnboardingGrid` so they can lock in their first Domain.
- Once they complete their first session (or bypass), call `completeOnboarding()` from `useTetherState` to clear the flag.

### STEP 3: Activate the AI Fitness Engine (The Gates)
- When the user selects the **Iron (Gym)** domain, you MUST execute `trickycardio()` from `useTetherState`. If it returns `liftingGated: true`, block access to the iron until they log 5 minutes of cardio.
- When the user selects a specific lift, execute `bitchweights()`. If their 1RM hasn't improved by 2% in 6 weeks, flag the UI with `force_amrap: true` and display the Valkyrie warning: *"Stagnation detected. AMRAP mode engaged."*

### STEP 4: Load Base & First Themes (VALKYRIE_MANIFEST)
- Wire `VALKYRIE_MANIFEST` from `src/registry/valkyrie/manifest.ts` into the UI.
- In the `WarRoom` or the main dashboard, display the user's active gear loadout (e.g., *"Equipped: Shimmer Crown [PRIME]"*).
- Ensure the `mode` switch (`MILITARY` vs `ETHER`) visually ties into these themes.

---

## 3. ARCHITECTURAL GUARDRAILS
- **DO NOT** use any `react-native` imports. We are in Vite/DOM land.
- Ensure all AI agent logs (from `agentLog.architect` and `agentLog.valkyrie`) are preserved and utilized during state transitions to maintain the immersive aesthetic.
- Do not break the existing Identity Upgrade workflow we just built in `WarRoom.tsx`.

---
**END OF PROTOCOL.**
