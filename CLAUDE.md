# TETHER — CLAUDE.md (Context Injector)

**Spectre Labs | Tether Mobile | v0.1.0**

---

## WHAT WE ARE BUILDING

Tether is a **React Native (Expo)** application designed as a universal activity tracker. It uses a "Domain-Agnostic" onboarding system to allow users to start tracking workouts, cardio sessions, or even desk-based micro-movements in three taps. The aesthetic is a dark, "military mode" terminal style.

---

## CURRENT STATE (as of 2026-04-23)

The application is built around a `NativeStack.Navigator`. The entry point is the `FitnessOnboardingGrid`.

**Screen 1 — `FitnessOnboardingGrid.tsx` (Universal Grid):**
- A 2-step selection process.
- **Step 1 (Domain):** A 4-button grid to select a domain: `Iron` (gym), `Road` (cardio), `Mat` (yoga/bodyweight), `Hub` (desk).
- **Step 2 (Activity):** A list of specific activities within the chosen domain.
- The "3-taps-to-active" protocol is enforced: Tap Domain -> Tap Activity -> Start Session.

**Active Session Screens:**
- **`PushDayOnboarding.tsx` (Iron Domain):** A detailed workout logger for a "Push Day". Allows inputting weight/reps, tracks sets, calculates estimated 1RM, and includes "Busy Gym," "Skip," and "Pain" protocols. Syncs data to Supabase.
- **`RoadSession.tsx` (Road Domain):** A timer for interval or steady-state cardio. Follows a manifest (e.g., Couch-to-5k) and displays current interval type and time remaining.
- **`MatSession.tsx` (Mat Domain):** A follow-along timer for a yoga flow. Displays the current pose and a countdown, with haptics for transitions.
- **`HubSession.tsx` (Hub Domain):** A minimal screen for tracking "Up-Time" and "Postural Resets" during a desk session.

---

## TECH STACK

| Layer | Tech |
|---|---|---|
| Framework | React Native (Expo) |
| Language | TypeScript |
| Navigation | @react-navigation/native-stack |
| Backend | Supabase |

---

## FILE MAP (Key Screens)

```
src/
  App.tsx                  — All UI logic; ShimmerCore 3D component inline
  index.css                — Tailwind import + body reset + .noise-overlay
  App.css                  — Vestigial Vite template styles (unused)
  main.tsx                 — React root mount
  registry/
    valkyrie/
      manifest.ts          — VALKYRIE_MANIFEST data (stubbed, not yet imported)
AGENT.md                   — Agent role & master file protocols
CLAUDE.md                  — This file (Context Injector)
```

---

## KEY STATE (App.tsx)

```ts
mode: 'MILITARY' | 'ETHER'       // aesthetic mode
isCalibrated: boolean             // gate between Bunker and War Room
staticLevel: number               // 0-100, slider value, currently unused
```

---

## VALKYRIE MANIFEST (registry/valkyrie/manifest.ts)

```ts
VALKYRIE_MANIFEST = {
  id: 'v-prime-01', codename: 'VALKYRIE', title: 'The Queen',
  gear: {
    helmets:  [ { Shimmer Crown, PRIME, queenOnly }, { Shadow Visor, ELITE } ],
    wings:    [ { Ethereal Flight-Span, PRIME, queenOnly }, { Carbon Thruster, COMMON } ]
  }
}
```
Not yet wired into any UI — ready for integration.

---

## SHIMMER FRAMEWORK RULES

- **MILITARY mode:** `#1e293b` slate, industrial/tactical aesthetic
- **ETHER mode:** `#6d28d9` purple, mystical/ethereal aesthetic
- Both modes share the same ShimmerCore geometry — only material color changes
- Future: Metaball Shader logic to differentiate modes more deeply

---

## INFRASTRUCTURE (added 2026-04-20)

```
supabase/
  migrations/
    01_initial_schema.sql    — profiles + life_sectors tables, RLS, updated_at triggers

src/lib/
  supabase.ts                — Supabase client + Profile/LifeSectors types
  agentLog.ts                — [Agent_Architect] / [Agent_Valkyrie] console log format

src/hooks/
  useTetherState.ts          — State machine: crisis_mode → onboarding_pending + 'minimalist' UIConfig
                               Also handles random handle generation (minimal friction for SOS users)

src/components/
  EntryGate.tsx              — 50/50 split: Chill Mode (left) / SOS Mode (right)
                               SOS button: "I DON'T KNOW I'M JUST LOSING IT" → triggerCrisisMode()
```

**REQUIRES before running:**
- `npm install @supabase/supabase-js` (not yet installed — awaiting approval)
- `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Wire EntryGate into App.tsx:**
```tsx
import EntryGate from './components/EntryGate';
// Replace Bunker screen or add before it:
<EntryGate onEnter={(mode) => { /* route to chill or sos experience */ }} />
```

---

## KNOWN GAPS / NEXT BUILD TARGETS

1. **(From Audit)** Implement a user-accessible "kill switch" for the SOS/anonymous mode to fully comply with the Feu Follet Charter.
2. `staticLevel` slider is captured but does nothing — wire to `distort` prop on `MeshDistortMaterial`.
3. `lucide-react` icons (Shield, Sparkles, Brain, Zap) imported but never rendered.
4. `App.css` is vestigial — safe to delete.
5. `DEPENDENCIES.docx` doesn't exist yet (referenced in AGENT.md).
6. ShimmerCore is inline in `App.tsx` — extract as complexity grows.
7. Supabase Auth flow not yet configured — `EntryGate` uses `supabase.auth.getUser()` with graceful fallback.

---

## DEV COMMANDS

```bash
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build
npm run lint      # ESLint
npm run preview   # Preview production build
```
