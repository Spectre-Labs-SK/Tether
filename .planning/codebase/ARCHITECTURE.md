<!-- refreshed: 2026-05-05 -->
# Architecture

**Analysis Date:** 2026-05-05

## System Overview

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                      DUAL BUILD ENTRY POINTS                             │
├───────────────────────────────┬──────────────────────────────────────────┤
│  Web (Vite dev sandbox)       │  Native (Expo / EAS — the product)       │
│  Entry: `src/App.tsx`         │  Entry: `index.js`                       │
│  Bundler: Vite                │  Bundler: Metro (`metro.config.cjs`)     │
│  tsconfig: `tsconfig.app.json`│  tsconfig: Expo/Metro internal           │
│  Styling: Tailwind v4 classes │  Styling: `StyleSheet.create()`          │
└───────────────────────────────┴──────────────────────────────────────────┘
         │                                       │
         ▼                                       ▼
┌──────────────────────────────┐  ┌─────────────────────────────────────────┐
│  Web Component Layer         │  │  Native Navigator                       │
│  `src/components/`           │  │  `src/native/NativeApp.tsx`             │
│  BunkerGate → App → WarRoom  │  │  createNativeStackNavigator             │
│  ShimmerCore (Three.js R3F)  │  │  initialRoute: FitnessOnboardingGrid    │
└──────────────────────────────┘  └─────────────────────────────────────────┘
         │                                       │
         ▼                                       ▼
┌──────────────────────────────┐  ┌─────────────────────────────────────────┐
│  Web Hook Layer              │  │  Native Screen Layer                    │
│  `src/hooks/`                │  │  `src/native/screens/`                  │
│  useTetherState              │  │  FitnessOnboardingGrid                  │
│  useJointOps                 │  │  PushDayOnboarding                      │
│  useArmory                   │  │  RoadSession / MatSession               │
│  usePatternObserver          │  │  HubSession / WorkoutSummary            │
└──────────────────────────────┘  └─────────────────────────────────────────┘
         │                                       │
         ▼                                       ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                        Shared Infrastructure                               │
│  `src/lib/supabase.ts`    — Supabase client + central DB type registry     │
│  `src/logic/synthesis/`   — Pure TS: synthesizeDay(userId,date)→DailyPlan  │
│  `src/stores/patternStore.ts` — Zustand (R3F bridge only)                  │
│  `src/registry/valkyrie/` — Valkyrie manifest + ShimmerMode type           │
└────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                        Supabase (source of truth)                          │
│  profiles, joint_ops, op_members, op_checkpoints                           │
│  hr_readings, op_hr_sync, hub_sessions, one_rm_history, workouts           │
│  `supabase/migrations/`                                                    │
└────────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `index.js` | Native entry; registers root component with Expo | `index.js` |
| `NativeApp` | Native navigator root; owns the full screen stack | `src/native/NativeApp.tsx` |
| `FitnessOnboardingGrid` (native) | Domain → Activity selection; owns `RootStackParamList` type | `src/native/screens/FitnessOnboardingGrid.tsx` |
| `PushDayOnboarding` | Iron/Push session flow; receives `{ shimmerMode }` param | `src/native/screens/PushDayOnboarding.tsx` |
| `RoadSession` | Cardio session tracker; receives `{ activityId }` param | `src/native/screens/RoadSession.tsx` |
| `MatSession` | Flexibility/bodyweight session tracker; receives `{ activityId }` | `src/native/screens/MatSession.tsx` |
| `HubSession` | Desk/active recovery tracker; writes to `hub_sessions` table | `src/native/screens/HubSession.tsx` |
| `WorkoutSummary` | Post-session summary; receives `{ workoutId }`; exits via `popToTop()` | `src/native/screens/WorkoutSummary.tsx` |
| `manifest.ts` | Domain/Activity registry + C25K intervals; imported by native screens | `src/native/screens/manifest.ts` |
| `App` (web) | Web shell root; owns `appMode` state machine (`gate`/`chill`/`sos`); threads `userId` | `src/App.tsx` |
| `BunkerGate` | Web auth entry; anonymous sign-in; 3000ms hard timeout; fires `onEnter(mode, userId)` | `src/components/BunkerGate.tsx` |
| `WarRoom` | Web main dashboard; receives `userId`; calls `useTetherState(userId)` | `src/components/WarRoom.tsx` |
| `ShimmerCore` | Three.js R3F sphere; reads `ShimmerTarget` from patternStore inside `useFrame` | `src/components/ShimmerCore.tsx` |
| `EntryGate` | Web identity upgrade UI (anonymous → registered) | `src/components/EntryGate.tsx` |
| `useTetherState` | SPEC-002: loads/creates profile; returns `{ state, isLoading, error, sync, updateTheme, triggerKillSwitch }` | `src/hooks/useTetherState.ts` |
| `useJointOps` | CRUD for joint_ops, members, checkpoints, HR sync | `src/hooks/useJointOps.ts` |
| `useArmory` | Analytics gates: `bitchweights()` (1RM stagnation), `trickycardio()` (cardio gate) | `src/hooks/useArmory.ts` |
| `usePatternObserver` | Maps app/domain signals → `ShimmerTarget` via `patternStore.setTarget` | `src/hooks/usePatternObserver.ts` |
| `patternStore` | Zustand store holding `ShimmerTarget`; written by React, read via `store.getState()` in `useFrame` | `src/stores/patternStore.ts` |
| `supabase.ts` | Supabase client singleton + all DB type definitions (`Profile`, `JointOp`, `HRReading`, etc.) | `src/lib/supabase.ts` |
| `synthesizeDay` | Pure TS aggregator; queries Supabase for workouts + checkpoints → `DailyPlan` | `src/logic/synthesis/nightlySynth.ts` |
| `DailyPlanSchema` | Type definitions for synthesis layer: `DailyPlan`, `DailyPlanEvent`, `DailyPlanAlternate` | `src/logic/synthesis/DailyPlanSchema.ts` |
| `VALKYRIE_MANIFEST` | Gear arrays (helmets/wings) indexed by shimmer mode | `src/registry/valkyrie/manifest.ts` |

## Pattern Overview

**Overall:** Dual-build layered architecture. Native (Expo) is the product. Web (Vite) is a dev sandbox. Both share `src/lib/supabase.ts` as the type registry and DB client.

**Key Characteristics:**
- DB-first state writes: always write to Supabase, then update local state — never optimistic (exception: `createOp` prepends to ops list)
- All hooks have explicit return types (`TetherStateReturn`, `JointOpsReturn`, `ArmoryReturn`)
- Zustand is used exclusively as an R3F bridge (React → Three.js `useFrame`) — not for general state
- `src/native/` is fully excluded from `tsconfig.app.json`; its code cannot be imported in web components

## Layers

**Native Screen Layer:**
- Purpose: All product UI — session flows, onboarding, summaries
- Location: `src/native/screens/`
- Contains: React Native functional components, `StyleSheet.create()`, local `COLORS` constants, navigation param types
- Depends on: `@react-navigation/native-stack`, `react-native-safe-area-context`, `src/native/screens/manifest.ts`, `src/registry/valkyrie/houses.ts`
- Used by: `src/native/NativeApp.tsx`

**Native Navigator:**
- Purpose: Stack navigator root, screen registration
- Location: `src/native/NativeApp.tsx`
- Contains: `createNativeStackNavigator<RootStackParamList>`, all screen imports
- Depends on: all screen files in `src/native/screens/`
- Used by: `index.js`

**Web Component Layer:**
- Purpose: Dev sandbox UI — auth gate, dashboard, Three.js canvas
- Location: `src/components/`
- Contains: React functional components, Tailwind v4 utility classes
- Depends on: `src/hooks/`, `src/lib/supabase.ts`, `src/stores/patternStore.ts`, `@react-three/fiber`
- Used by: `src/App.tsx`

**Hook Layer:**
- Purpose: Supabase data operations, analytics gates, R3F bridge signal dispatch
- Location: `src/hooks/`
- Contains: Custom hooks with explicit return types; all follow DB-first write pattern
- Depends on: `src/lib/supabase.ts`, `src/stores/patternStore.ts`
- Used by: Web components (`WarRoom`, `BunkerGate`, `EntryGate`, `App`)

**Synthesis Layer:**
- Purpose: Pure TS daily plan aggregation — no React, no side effects
- Location: `src/logic/synthesis/`
- Contains: `synthesizeDay(userId, date)`, `DailyPlanSchema.ts` types, `index.ts` barrel
- Depends on: `src/lib/supabase.ts`
- Used by: No active UI consumer yet — future native screen integration

**Registry Layer:**
- Purpose: Static manifests and type constants
- Location: `src/registry/valkyrie/`
- Contains: `VALKYRIE_MANIFEST` (helmets/wings gear arrays), `ShimmerMode` type (`'MILITARY' | 'ETHER'`)
- Depends on: nothing
- Used by: `src/components/BunkerGate.tsx`, `src/native/screens/FitnessOnboardingGrid.tsx`

**Infrastructure Layer:**
- Purpose: Supabase client singleton and all DB types
- Location: `src/lib/supabase.ts`
- Contains: `createClient`, `upgradeAnonymousUser`, `signInWithEmailPassword`, all exported DB types
- Depends on: `@supabase/supabase-js`, `process.env.EXPO_PUBLIC_*`
- Used by: hooks, synthesis, web components, native screens

## Data Flow

### Native Session Flow (Primary Product Path)

1. Expo launches `index.js` → `registerRootComponent(NativeApp)` (`index.js:3`)
2. `NativeApp` renders `NavigationContainer` + `Stack.Navigator`, `initialRouteName="FitnessOnboardingGrid"` (`src/native/NativeApp.tsx:15`)
3. User selects domain in `FitnessOnboardingGrid` → activity → `navigation.navigate('PushDayOnboarding', { shimmerMode: 'MILITARY' })` (`src/native/screens/FitnessOnboardingGrid.tsx:57`)
4. Session screen runs workout, then navigates to `WorkoutSummary` with `{ workoutId }` param
5. `WorkoutSummary` displays summary; "RETURN TO BASE" calls `navigation.popToTop()` back to `FitnessOnboardingGrid` (`src/native/screens/WorkoutSummary.tsx:39`)

**Hub shortcut (2-tap flow):**
- Tap `Hub` domain → `navigation.navigate('HubSession')` directly, skipping activity selection (`src/native/screens/FitnessOnboardingGrid.tsx:39`)

### Web Auth + State Flow (Dev Sandbox)

1. Vite loads `src/App.tsx`; initial `appMode = 'gate'` renders `BunkerGate` (`src/App.tsx:136`)
2. `BunkerGate` calls `supabase.auth.signInAnonymously()`; 3000ms hard timeout transitions to offline mode if Supabase unavailable (`src/components/BunkerGate.tsx:46`)
3. Auth resolves → `onEnter(mode, userId)` → `App` sets `userId` state, switches `appMode` to `'chill'` (`src/App.tsx:125`)
4. `WarRoom` renders; calls `useTetherState(userId)` → loads or bootstraps `profiles` row (`src/hooks/useTetherState.ts:86`)
5. All profile mutations: `supabase.update(...)` confirmed → `setState(toTetherState(data))`

### R3F / ShimmerCore Bridge

1. React signals (app mode, domain, crisis state) are observed by `usePatternObserver`
2. `usePatternObserver` maps signals to a `ShimmerTarget` shape → calls `patternStore.setTarget(next)` (`src/hooks/usePatternObserver.ts:16`)
3. `ShimmerCore`'s `useFrame` reads `usePatternStore.getState()` (non-reactive) each frame; lerps material properties toward the current target

**State Management:**
- Profile state: `useState` in `useTetherState`; Supabase `profiles` table is source of truth
- Ops list: `useState` in `useJointOps`; Supabase `joint_ops` table is source of truth
- ShimmerCore visual state: Zustand `patternStore`; only for R3F render loop bridge
- Navigation state: React Navigation stack (native only)
- App mode (web): `useState<AppMode>` in `src/App.tsx`

## Key Abstractions

**TetherState (SPEC-002):**
- Purpose: Unified profile shape; extends `Profile` with `is_nightmare_active`, `theme_state: ValkyrieTheme`, `last_sync_timestamp`
- File: `src/hooks/useTetherState.ts:30`
- Pattern: `toTetherState(raw)` normalizer supplies safe defaults for columns pending migration 06

**RootStackParamList:**
- Purpose: Navigation type contract — all screen names and their route params
- File: `src/native/screens/FitnessOnboardingGrid.tsx:10`
- Pattern: Exported from `FitnessOnboardingGrid.tsx`; imported by `NativeApp.tsx` and individual screens via `import type { RootStackParamList }`

**DailyPlan / DailyPlanEvent:**
- Purpose: Output type of `synthesizeDay`; every event carries non-null `alternate: DailyPlanAlternate`
- File: `src/logic/synthesis/DailyPlanSchema.ts`
- Invariant: `alternate` is never optional — synthesizer must always populate it

**ActivityDomain vs Domain:**
- `ActivityDomain` (`'iron' | 'road' | 'mat' | 'hub'`) — synthesis layer, lowercase (`src/logic/synthesis/DailyPlanSchema.ts:1`)
- `Domain` (`'Iron' | 'Road' | 'Mat' | 'Hub'`) — native screens, title-case (`src/native/screens/manifest.ts:1`)
- These are parallel types — not shared, not interchangeable

## Entry Points

**Native Product:**
- Location: `index.js`
- Triggers: Expo runtime on device/emulator/EAS build
- Responsibilities: `registerRootComponent(NativeApp)` — the only thing this file does

**Web Sandbox:**
- Location: `src/App.tsx`
- Triggers: Vite dev server (`npm run dev`)
- Responsibilities: Owns `appMode` state machine, threads `userId` to `WarRoom`, renders SOS/chill/gate modes

## Architectural Constraints

- **tsconfig isolation:** `tsconfig.app.json` excludes `src/native/`. Never import from `src/native/` in web components.
- **Domain data duplication:** `src/native/screens/manifest.ts` cannot be imported by web components. Replicate data locally if needed — see `src/components/fitness/FitnessOnboardingGrid.tsx`.
- **Zustand scope:** `patternStore` is only for R3F. Do not use Zustand for state without a render-loop consumer.
- **DB-first writes:** Never optimistic-update before Supabase confirms. Exception: `createOp` prepend in `useJointOps`.
- **verbatimModuleSyntax:** Pure type imports must use `import type { Foo }` or `import { value, type Foo }`.
- **No React import in native files:** `react/jsx-runtime` handles JSX. `import React from 'react'` triggers TS6133.
- **CNG:** `android/` and `ios/` are gitignored. Never commit native folders. EAS Build runs `expo prebuild` automatically.
- **triggerKillSwitch:** Fire-and-forget (`() => void`). Clear local state immediately, then `signOut` async without await. Ethics Charter requirement.

## Anti-Patterns

### Importing from `src/native/` in web components

**What happens:** A web component imports a type or constant from `src/native/screens/`.
**Why it's wrong:** `src/native/` is excluded from `tsconfig.app.json`. Vite will not resolve these imports.
**Do this instead:** Replicate required domain data locally. See `src/components/fitness/FitnessOnboardingGrid.tsx`.

### Using Zustand for non-R3F state

**What happens:** A hook stores server-derived state in `patternStore` or a new Zustand store.
**Why it's wrong:** Bypasses the DB-first pattern and creates two sources of truth.
**Do this instead:** Use local `useState` in the hook; write to Supabase first, then update state.

### Calling `usePatternStore()` inside `useFrame`

**What happens:** A `useFrame` callback uses `usePatternStore((s) => s.target)` with a selector.
**Why it's wrong:** React hooks cannot be called inside the Three.js render loop — violates Rules of Hooks.
**Do this instead:** Use `usePatternStore.getState()` (non-reactive direct read) inside `useFrame`.

### `signOut + signIn` for identity upgrade

**What happens:** Anonymous user is signed out then signed back in with email/password.
**Why it's wrong:** Creates a new UUID, destroying all profile data, joint ops, and history.
**Do this instead:** `supabase.auth.updateUser({ email, password })` — preserves UUID. See `src/lib/supabase.ts:upgradeAnonymousUser`.

## Error Handling

**Strategy:** Explicit `useState<Error | null>` in hooks; all failure paths log via `agentLog.architect()`.

**Patterns:**
- `useTetherState`: sets `error` state on Supabase failure; caller checks `error` field
- `BunkerGate`: hard 3000ms auth timeout — offline mode allows entry without `userId`
- `useArmory`: returns safe defaults (`[]`, empty gate object) on null `userId` or Supabase error

## Cross-Cutting Concerns

**Logging:** `agentLog.architect()` for operational/debug; `agentLog.valkyrie()` for persona/narrative. Never use `console.log`. Location: `src/lib/agentLog.ts`.

**Validation:** Supabase RLS enforces `profile_id = auth.uid()` on all tables. App-level: `userId` null checks at the top of every hook.

**Authentication:** Anonymous sessions by default (`signInAnonymously()`). Upgrade via `supabase.auth.updateUser({ email, password })`. Detect `is_anonymous` by casting `session.user as { is_anonymous?: boolean }`.

**Environment Variables:** Both Vite and Metro resolve `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Vite injects via `define` block in `vite.config.ts`; Metro resolves `EXPO_PUBLIC_*` natively. Client falls back to placeholder strings if `.env.local` is absent.

---

*Architecture analysis: 2026-05-05*
