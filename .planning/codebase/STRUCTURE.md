<!-- refreshed: 2026-05-05 -->
# Directory Structure

> **2026-05-12 correction:** Directory facts below are useful, but old fitness/domain screens are legacy implementation artifacts. Current product direction is AI-first plan generation, behavior tracking from download, adaptive controls, themes/hidden themes/Bunker, and finance-pantry executive function.

**Last mapped:** 2026-05-05

## Layout

```
tether-safe/
├── index.js                        # Native entry — registerRootComponent(NativeApp)
├── src/
│   ├── App.tsx                     # Web entry — mode state machine (gate/chill/sos)
│   ├── assets/                     # Static assets (images, fonts)
│   ├── components/                 # Web-only React components
│   │   ├── BunkerGate.tsx          # Auth gate — anonymous sign-in, 3s timeout
│   │   ├── WarRoom.tsx             # Main web shell post-auth
│   │   ├── ShimmerCore.tsx         # Three.js R3F sphere (MeshDistortMaterial)
│   │   └── fitness/
│   │       ├── FitnessOnboardingGrid.tsx  # Web port of native onboarding
│   │       └── PushDaySession.tsx         # Web port of push day session
│   ├── hooks/                      # Shared domain hooks (web + native)
│   │   ├── useArmory.ts            # Analytics gates (bitchweights, trickycardio)
│   │   ├── useBunkerTap.ts         # Tap-sequence detection
│   │   ├── useJointOps.ts          # Joint op CRUD + checkpoint + HR sync
│   │   ├── usePatternObserver.ts   # Signals → patternStore bridge (R3F)
│   │   └── useTetherState.ts       # SPEC-002 profile hook
│   ├── lib/
│   │   └── supabase.ts             # Supabase client + all DB types (canonical type registry)
│   ├── logic/
│   │   └── synthesis/
│   │       ├── DailyPlanSchema.ts  # Pure TS types: DailyPlan, DailyPlanEvent, etc.
│   │       └── nightlySynth.ts     # synthesizeDay() — aggregates Supabase data into DailyPlan
│   ├── native/                     # Expo/RN only — EXCLUDED from tsconfig.app.json
│   │   ├── NativeApp.tsx           # Navigator root (Stack.Navigator)
│   │   ├── navigation.types.ts     # Canonical RootStackParamList for native stack
│   │   └── screens/
│   │       ├── manifest.ts         # DOMAINS, activity arrays, C25K intervals
│   │       ├── FitnessOnboardingGrid.tsx   # Domain/activity selector screen
│   │       ├── PushDayOnboarding.tsx       # Iron domain workout screen
│   │       ├── RoadSession.tsx             # Road domain (run/cycle) screen
│   │       ├── MatSession.tsx              # Mat domain (yoga/bodyweight) screen
│   │       ├── HubSession.tsx              # Hub domain (desk session) screen
│   │       └── WorkoutSummary.tsx          # Post-session summary screen
│   ├── registry/
│   │   └── valkyrie/
│   │       ├── houses.ts           # ShimmerMode type, house definitions
│   │       └── manifest.ts         # VALKYRIE_MANIFEST (gear, pushDay exercises)
│   └── stores/
│       └── patternStore.ts         # Zustand store — R3F bridge ONLY
├── supabase/
│   ├── migrations/                 # Postgres migration files (applied via Supabase CLI)
│   │   ├── 05_identity_upgrade.sql
│   │   └── 06_tether_state_and_hub_sessions.sql
│   └── functions/                  # Supabase Edge Functions (stubs)
│       ├── calculate-1rm/
│       └── sync-workout/
├── .planning/
│   ├── codebase/                   # Architecture/convention docs for AI agents
│   │   ├── ARCHITECTURE.md
│   │   ├── STRUCTURE.md
│   │   ├── CONVENTIONS.md
│   │   ├── TESTING.md
│   │   ├── STACK.md
│   │   ├── INTEGRATIONS.md
│   │   └── CONCERNS.md
│   └── phases/                     # Completed phase plans and summaries
├── .wolf/                          # OpenWolf context management
│   ├── anatomy.md                  # File index with token estimates
│   ├── cerebrum.md                 # Learning memory (preferences, learnings, do-not-repeat)
│   ├── memory.md                   # Session action log
│   └── skill-observations/         # Task observer logs
├── public/                         # Vite static assets
├── dist/                           # Vite production build output (gitignored)
├── patches/                        # patch-package patches (expo-modules-core)
├── index.css                       # Global CSS (Tailwind directives)
├── vite.config.ts                  # Vite config (env define block for EXPO_PUBLIC_*)
├── tsconfig.app.json               # Web build tsconfig (excludes src/native/)
├── metro.config.cjs                # Metro config (.cjs required — package.json type:module)
├── babel.config.js                 # Expo babel preset
├── app.json                        # Expo app config (name, slug, EAS projectId)
└── package.json                    # npm manifest — "main": "index.js" required for EAS
```

## Key Locations

**Native Entry:**
- `index.js` — Registers `NativeApp` with Expo. Required by EAS Build via `"main": "index.js"` in `package.json`.
- `src/native/NativeApp.tsx` — Navigator root. All screens registered here.

**Web Entry:**
- `src/App.tsx` — Web mode state machine. Threads `userId` to `WarRoom`.

**DB Type Registry (canonical):**
- `src/lib/supabase.ts` — All Supabase types live here: `Profile`, `JointOp`, `OpMember`, `OpCheckpoint`, `HRReading`, `OpHRSync`, `LifeSectors`. Add new DB types here, nowhere else.

**Navigation Types (canonical):**
- `src/native/navigation.types.ts` — `RootStackParamList`. All screen param types go here. `NativeApp.tsx` imports from here.

**Domain Manifest:**
- `src/native/screens/manifest.ts` — All domain/activity data and C25K intervals. Consumed by native screens. Web components replicate needed data locally.

**Valkyrie Registry:**
- `src/registry/valkyrie/manifest.ts` — `VALKYRIE_MANIFEST` (gear, exercises). Used by both web (`WarRoom`, `BunkerGate`) and native screens.
- `src/registry/valkyrie/houses.ts` — `ShimmerMode` type.

**State Bridge:**
- `src/stores/patternStore.ts` — Zustand. Sole purpose: bridge `usePatternObserver` (React) to `ShimmerCore` `useFrame` (Three.js render loop). `ShimmerTarget` defaults defined here.

**Pure Logic:**
- `src/logic/synthesis/nightlySynth.ts` — `synthesizeDay(userId, date)` — no UI consumer yet.
- `src/logic/synthesis/DailyPlanSchema.ts` — All synthesis types.

**Migrations:**
- `supabase/migrations/` — Sequential SQL files. Apply via `supabase db push` or Supabase CLI. Migration 06 adds `is_nightmare_active`, `theme_state` to `profiles` + creates `hub_sessions`.

## Naming Conventions

**Components:**
- PascalCase: `EntryGate`, `WarRoom`, `ShimmerCore`, `BunkerGate`
- Files match component name: `WarRoom.tsx`

**Hooks:**
- `use` prefix, camelCase: `useTetherState`, `useJointOps`, `useArmory`, `usePatternObserver`
- All hook return types must be explicitly typed: `TetherStateReturn`, `JointOpsReturn`, `ArmoryReturn`

**Types / Interfaces:**
- PascalCase: `Profile`, `JointOp`, `TetherState`, `DailyPlan`, `ShimmerTarget`

**Constants / Manifests:**
- SCREAMING_SNAKE_CASE: `VALKYRIE_MANIFEST`, `C25K_WEEK_1_DAY_1`, `DOMAIN_ALTERNATES`, `DEFAULTS`

**Database columns:**
- snake_case: `is_crisis_mode`, `one_rm_kg`, `shimmer_mode`, `profile_id`

**Files:**
- PascalCase for components and screens: `WarRoom.tsx`, `PushDayOnboarding.tsx`
- camelCase for libs, hooks, logic: `supabase.ts`, `useTetherState.ts`, `nightlySynth.ts`
- SCREAMING_SNAKE_CASE for manifests when named: `manifest.ts` (filename), exported as `VALKYRIE_MANIFEST`

**Directories:**
- camelCase: `components/`, `hooks/`, `lib/`, `logic/`, `stores/`, `registry/`
- Feature subdirectory: `components/fitness/`, `logic/synthesis/`, `registry/valkyrie/`
- Native-only: `native/` (excluded from web tsconfig)

## Module Boundaries

**The hard boundary: web vs. native**
- `src/native/` is excluded from `tsconfig.app.json`. Nothing in `src/components/`, `src/hooks/`, or `src/App.tsx` may import from `src/native/`.
- If web needs data from a native manifest (e.g., domain list), replicate it locally. See `src/components/fitness/FitnessOnboardingGrid.tsx`.

**Hooks are shared across both pipelines** unless they import React Native APIs. Current hooks (`useTetherState`, `useJointOps`, `useArmory`, `usePatternObserver`) are web-only in practice but contain no RN imports.

**`src/logic/synthesis/`** — Pure TypeScript. No React, no React Native. Safe to import from any context. No screen-level imports yet (no native consumer built).

**`src/registry/valkyrie/`** — Pure constants/types. Importable everywhere, both web and native.

**`src/stores/patternStore.ts`** — Web-only in practice. Zustand for R3F bridge. Do not import this in native screens.

**`src/lib/supabase.ts`** — Shared by web and native (supabase-js works in both). This is also the type registry — all DB types live here.

## Where to Add New Code

**New native screen:**
1. Create `src/native/screens/NewScreen.tsx`
2. Add its params to `src/native/navigation.types.ts` → `RootStackParamList`
3. Register `<Stack.Screen>` in `src/native/NativeApp.tsx`
4. Use `StyleSheet.create()` + file-top `COLORS` constants for styling (no Tailwind)

**New domain hook:**
1. Create `src/hooks/useNewHook.ts`
2. Export an explicit return type (e.g., `NewHookReturn`)
3. Import `supabase` from `src/lib/supabase`
4. Follow DB-first pattern: write to Supabase, then update local state

**New DB type:**
- Add to `src/lib/supabase.ts` — the canonical type registry

**New migration:**
- Add numbered SQL file to `supabase/migrations/` following existing sequence

**New registry/manifest constant:**
- Add to `src/registry/valkyrie/` (gear, exercise data) or `src/native/screens/manifest.ts` (domain/activity data for native)

**New synthesis logic:**
- Add to `src/logic/synthesis/` — pure TypeScript only, no React imports

**New web component:**
- Add to `src/components/` (or `src/components/fitness/` for fitness-domain UI)
- Use Tailwind v4 inline utility classes for styling
- Do not import from `src/native/`

## Special Directories

**`src/native/`:**
- Purpose: All Expo/React Native screens and navigator
- Generated: No (hand-authored)
- Committed: Yes
- tsconfig: Excluded from `tsconfig.app.json` — included by Metro internally

**`android/` and `ios/`:**
- Purpose: Generated native project folders
- Generated: Yes — by `expo prebuild` during EAS Build (CNG pattern)
- Committed: No (gitignored)

**`dist/`:**
- Purpose: Vite production build output
- Generated: Yes — by `npm run build`
- Committed: No

**`.wolf/`:**
- Purpose: OpenWolf context management (anatomy, cerebrum, memory, skill observations)
- Must be updated after significant file changes (`anatomy.md`) and after corrections/learnings (`cerebrum.md`)

**`.planning/codebase/`:**
- Purpose: Architecture/convention docs consumed by GSD planning and execution agents
- These files are the current documents

**`supabase/.temp/`:**
- Purpose: Supabase CLI temp files
- Committed: No

---

*Structure analysis: 2026-05-05*
