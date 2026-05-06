<!-- refreshed: 2026-05-05 -->
# Architecture

**Last mapped:** 2026-05-05

## Pattern

Dual-pipeline, feature-layered. Two completely separate build pipelines share source but never cross over. Within each pipeline, the architecture is layered: entry point → UI/screen → domain hooks → data layer (Supabase). Pure logic lives in a separate `src/logic/` module with no React dependencies.

## Build Split

| Pipeline | Entry | Bundler | tsconfig | Purpose |
|----------|-------|---------|----------|---------|
| **Web (Vite)** | `src/App.tsx` | Vite | `tsconfig.app.json` (`include: ["src"]`, `exclude: ["src/native"]`) | Dev sandbox only — not the product |
| **Native (Expo/Metro)** | `index.js` → `src/native/NativeApp.tsx` | Metro | Expo internal | **The actual product** |

`src/native/` is excluded from `tsconfig.app.json`. The Vite build never touches it. The native build does not use Vite. This boundary is hard — never import across it.

```text
┌─────────────────────────────────────────────────────────┐
│            Web Pipeline (Vite dev sandbox)               │
│  src/App.tsx → BunkerGate → WarRoom → ShimmerCore       │
│  tsconfig.app.json   excludes src/native/               │
└────────────────────────────┬────────────────────────────┘
                             │  shared source, never imported across
┌────────────────────────────▼────────────────────────────┐
│            Native Pipeline (Expo / Metro)                │
│  index.js → NativeApp.tsx → Stack Navigator → Screens   │
│  metro.config.cjs    includes all src/ including native  │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│            Shared Source (consumed by both)              │
│  src/lib/supabase.ts    src/registry/valkyrie/           │
│  src/hooks/             src/logic/synthesis/             │
│  src/stores/            src/native/screens/manifest.ts   │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│            Supabase (source of truth)                    │
│  Auth · profiles · joint_ops · workouts · hr_readings   │
│  op_checkpoints · op_members · hub_sessions · one_rm_history │
└─────────────────────────────────────────────────────────┘
```

## Layers & Responsibilities

**Entry Point Layer**
- Web: `src/App.tsx` — renders mode state machine (`gate` | `chill` | `sos`), threads `userId` down
- Native: `index.js` calls `registerRootComponent(NativeApp)`. `src/native/NativeApp.tsx` mounts `NavigationContainer` with a native stack

**Auth / Gate Layer (Web)**
- `src/components/BunkerGate.tsx` — anonymous Supabase sign-in, 3-second hard timeout for offline fallback, surfaces `userId`. Emits `onEnter(mode, userId)` upward.

**Screen Layer (Native)**
- `src/native/screens/FitnessOnboardingGrid.tsx` — domain/activity selector, entry point to workouts
- `src/native/screens/PushDayOnboarding.tsx` — Iron domain workout (sets, 1RM tracking, shimmer mode)
- `src/native/screens/RoadSession.tsx` — Road domain (running/cycling with timer)
- `src/native/screens/MatSession.tsx` — Mat domain (yoga/bodyweight flow)
- `src/native/screens/HubSession.tsx` — Hub domain (desk session, movement tracking)
- `src/native/screens/WorkoutSummary.tsx` — Post-session summary display

**UI Component Layer (Web)**
- `src/components/WarRoom.tsx` — Main app shell post-auth: orchestrates useTetherState, useArmory, usePatternObserver; hosts ShimmerCore canvas + onboarding overlay
- `src/components/ShimmerCore.tsx` — Three.js R3F `MeshDistortMaterial` sphere; reads from patternStore via non-reactive `store.getState()` inside `useFrame`
- `src/components/BunkerGate.tsx` — Auth gate
- `src/components/fitness/FitnessOnboardingGrid.tsx` — Web port of native onboarding (domain data replicated locally — cannot import from `src/native/`)

**Domain Hooks Layer (Shared)**
- `src/hooks/useTetherState.ts` — SPEC-002. Profile fetch/bootstrap, DB-first state. Returns `{ state, isLoading, error, sync, updateTheme, triggerKillSwitch }`. State type: `TetherState` (extends `Profile` with nightmare/theme/sync fields).
- `src/hooks/useJointOps.ts` — Joint op CRUD (owned + member ops, checkpoints, HR sync). Returns `JointOpsReturn`.
- `src/hooks/useArmory.ts` — Analytics gates: `bitchweights()` (1RM stagnation → AMRAP flag), `trickycardio()` (pre-lift HR clearance gate). Returns `ArmoryReturn`.
- `src/hooks/usePatternObserver.ts` — Translates app signals (mode, shimmerMode, crisis, domain, gates) into `ShimmerTarget` and writes to `patternStore`. Priority order: SOS > trickycardio gate > bitchweights > domain > shimmer mode.
- `src/hooks/useBunkerTap.ts` — Tap-sequence detection (BUNKER_SEQUENCE [1,2,1], 1500ms timeout)

**State Bridge Layer**
- `src/stores/patternStore.ts` — Zustand store. **Only used for the R3F render loop bridge.** React hooks cannot call `useState` inside `useFrame`; Zustand's `store.getState()` bypasses that constraint. `ShimmerTarget` fields: distort, color, speed, metalness, emissiveIntensity, floatIntensity, floatSpeed.

**Data / Client Layer (Shared)**
- `src/lib/supabase.ts` — Central Supabase client + **all DB TypeScript types** (`Profile`, `JointOp`, `OpMember`, `OpCheckpoint`, `HRReading`, `OpHRSync`, `LifeSectors`). New DB types always go here.
- Auth helpers: `upgradeAnonymousUser()`, `signInWithEmailPassword()`

**Pure Logic Layer (Shared)**
- `src/logic/synthesis/nightlySynth.ts` — `synthesizeDay(userId, date)` aggregates workouts + checkpoints + HR peak from Supabase into a `DailyPlan`. Pure TypeScript, no React. No active UI consumer yet.
- `src/logic/synthesis/DailyPlanSchema.ts` — Type definitions for the synthesis layer

**Registry / Manifests (Shared)**
- `src/registry/valkyrie/manifest.ts` — `VALKYRIE_MANIFEST` (gear loadout: helmets/wings with rarity, pushDay exercise list)
- `src/registry/valkyrie/houses.ts` — `ShimmerMode` type (`'MILITARY' | 'ETHER'`), house definitions
- `src/native/screens/manifest.ts` — `DOMAINS` data (Iron/Road/Mat/Hub), activity arrays, `C25K_WEEK_1_DAY_1` intervals

**Database Layer**
- `supabase/migrations/` — Postgres migration files (05, 06 present). Applied via Supabase CLI. Native folders (`android/`, `ios/`) are gitignored — CNG (Continuous Native Generation) via `expo prebuild`.

## Entry Points

**Native (product):**
- `index.js` — Calls `registerRootComponent(NativeApp)`. `"main": "index.js"` must be in `package.json`.
- `src/native/NativeApp.tsx` — Navigator root. Mounts `NavigationContainer` + `createNativeStackNavigator`. `initialRouteName: "FitnessOnboardingGrid"`. `headerShown: false`.

**Web (dev sandbox):**
- `src/App.tsx` — Mode state machine. `appMode: 'gate' | 'chill' | 'sos'`. Renders: `BunkerGate` → `WarRoom` (chill) or `SOSShell` (sos).

## Data Flow

### Native: User Opens App

1. `index.js` registers `NativeApp` with Expo (`src/native/NativeApp.tsx`)
2. Navigator renders `FitnessOnboardingGrid` (initial route) (`src/native/screens/FitnessOnboardingGrid.tsx`)
3. User selects domain → navigates to session screen (e.g., `PushDayOnboarding`) with `shimmerMode` param
4. Session screen writes workout data to Supabase (`workouts`, `workout_sets`, `hr_readings`)
5. On completion, navigates to `WorkoutSummary` with `workoutId`

### Web: Auth & Profile Load

1. `App` renders `BunkerGate` (`src/components/BunkerGate.tsx`)
2. `BunkerGate` calls `supabase.auth.signInAnonymously()` — 3-second timeout fallback to offline
3. `onEnter(mode, userId)` fires → App stores mode + userId → renders `WarRoom`
4. `WarRoom` calls `useTetherState(userId)` → fetches profile from `profiles` table (or bootstraps if missing)
5. `WarRoom` calls `useArmory(userId)` → resolves `trickycardio()` + `bitchweights()` on calibration
6. `usePatternObserver` receives signals → writes to `patternStore` → `ShimmerCore` reads via `useFrame`

### Three.js Render Loop Bridge (R3F)

1. `usePatternObserver` (React) → `patternStore.setTarget(...)` (Zustand write — reactive)
2. `ShimmerCore` `useFrame` → `patternStore.getState().target` (Zustand non-reactive direct read — safe in render loop)
3. LERP applied each frame toward target values → `MeshDistortMaterial` updated

### DB-First State Update Pattern

All state mutations follow this contract:

```typescript
// 1. Write to Supabase
const { data, error } = await supabase.from('profiles').update({ ... }).eq('id', userId).select().single();
// 2. Update local state only on success
if (!error && data) setState(toTetherState(data));
// Never optimistic-update before Supabase confirms (except ops list prepend on createOp)
```

### Anonymous → Permanent Identity Upgrade

1. User has anonymous session (`is_anonymous: true` in JWT)
2. `upgradeAnonymousUser(email, password)` calls `supabase.auth.updateUser({ email, password })`
3. Same UUID preserved — all profile data, ops, history intact
4. Never use signOut+signIn for this purpose

## Key Abstractions

**`TetherState`** (`src/hooks/useTetherState.ts`)
- Extends `Profile` with `is_nightmare_active`, `theme_state: ValkyrieTheme`, `last_sync_timestamp`
- Fields `is_nightmare_active` and `theme_state` pending migration 06 — `toTetherState()` supplies defaults

**`DailyPlan` / `DailyPlanEvent`** (`src/logic/synthesis/DailyPlanSchema.ts`)
- `DailyPlanEvent.alternate: DailyPlanAlternate` is **non-nullable** — synthesizer contract. Every event always has a populated alternate. Never make it optional.
- Domain alternate map: `iron→mat`, `road→hub`, `mat→hub`, `hub→mat`, `checkpoint→hub/Defer`

**`ShimmerTarget`** (`src/stores/patternStore.ts`)
- The contract between React state and the Three.js render loop
- Fields: `distort`, `color`, `speed`, `metalness`, `emissiveIntensity`, `floatIntensity`, `floatSpeed`

**`RootStackParamList`** (`src/native/navigation.types.ts`)
- Canonical navigation type for the native stack. Defines all screen params.
- Previously duplicated in `PushDayOnboarding.tsx` — now consolidated here.

**`VALKYRIE_MANIFEST`** (`src/registry/valkyrie/manifest.ts`)
- Static gear registry. Helmets[0] = ETHER gear (PRIME), Helmets[1] = MILITARY gear (ELITE).
- Gear loadout: `ETHER → helmets[0] + wings[0]`, `MILITARY → helmets[1] + wings[1]`

## State Management

**Default: local `useState`.**
All component and screen state uses local `useState`. No global state for UI concerns.

**Exception — Zustand (`src/stores/patternStore.ts`) for R3F bridge only.**
React hooks cannot be called inside a Three.js `useFrame` loop. Zustand's `store.getState()` (non-reactive) is called directly inside `useFrame` to read the current `ShimmerTarget` without subscribing to re-renders. Do not use Zustand for any state that has no render-loop consumer.

**Supabase is the source of truth.**
Always write to DB first. Only update local state after Supabase confirms. No optimistic updates (except `createOp` ops-list prepend).

**`userId` threading:**
`BunkerGate.onEnter(mode, userId)` → `App` state → `WarRoom` prop → `useTetherState(userId)`. Avoids prop-drilling auth through unrelated components. WarRoom calls `useTetherState` independently.

## Architectural Constraints

- **Threading:** Single-threaded React event loop. Three.js render runs in `useFrame` (RAF). Bridge via Zustand `store.getState()` — no React hook calls inside `useFrame`.
- **Build isolation:** `src/native/` is excluded from `tsconfig.app.json`. Domain/Activity data needed in web components must be replicated locally — never imported from `src/native/`.
- **CNG:** `android/` and `ios/` are gitignored. Generated by `expo prebuild` during EAS Build. Never commit or manually edit native folders.
- **metro.config.cjs:** Must use `.cjs` extension (not `.js`) because `package.json` has `"type": "module"`. Must require `expo/metro-config` (not `@expo/metro-config`).
- **verbatimModuleSyntax:** Type-only imports require `import type { Foo }` or `import { value, type TypeOnly }`.
- **No bare React import in native:** Do not `import React from 'react'` — `react/jsx-runtime` handles JSX and `noUnusedLocals` flags it as an error.

## Anti-Patterns

### Importing from `src/native/` in the Vite build
**What happens:** `tsconfig.app.json` excludes `src/native/`. Any import from web components into that directory causes type errors and Vite build failure.
**Why it's wrong:** Breaks the dual-pipeline split — web bundle must be Metro-free.
**Do this instead:** Replicate domain/activity data locally in the web component (see `src/components/fitness/FitnessOnboardingGrid.tsx`).

### Using Zustand outside the R3F bridge
**What happens:** Adding Zustand stores for general UI state.
**Why it's wrong:** Adds unnecessary complexity; `useState` + Supabase is the declared pattern for all non-render-loop state.
**Do this instead:** Use local `useState`. Write to Supabase first; update local state on success.

### Optimistic UI updates
**What happens:** Updating local state before Supabase confirms writes.
**Why it's wrong:** Breaks DB-first invariant; state can diverge from DB on error.
**Do this instead:** Always write to Supabase first, then call `setState(toTetherState(data))` with confirmed data. Exception: `createOp` prepends to ops list optimistically.

### Awaiting `triggerKillSwitch`
**What happens:** Treating the kill switch as async.
**Why it's wrong:** `triggerKillSwitch` is `() => void`. It clears local state immediately then calls `supabase.auth.signOut()` fire-and-forget. Ethics Charter requirement — the UI must clear instantly.
**Do this instead:** Call `triggerKillSwitch()` without `await`. Never block on it.

## Error Handling

**Strategy:** Fail-open with logging. Most errors are caught, logged via `agentLog.architect()`, and the system continues with safe defaults.

**Patterns:**
- Auth timeout: `BunkerGate` uses a 3-second hard timeout — offline fallback, never blocks the gate
- Profile bootstrap: If `profiles` fetch fails, auto-inserts a new row with `generateRandomHandle()`
- Armory gates: `trickycardio()` errors → gate deactivated (fail-open, lifting allowed). Network errors logged but not surfaced to user.
- Op membership errors: Falls back to owned ops only
- Kill switch sign-out error: Caught silently (`.catch()`), local state already cleared

## Cross-Cutting Concerns

**Logging:** `agentLog.architect()` for operational/debug; `agentLog.valkyrie()` for persona/narrative. Located in `src/lib/agentLog.ts`. Never use bare `console.log`.

**Authentication:** Anonymous sessions via `supabase.auth.signInAnonymously()`. `is_anonymous` detected by casting `session.user as { is_anonymous?: boolean }` (property exists in JWT but not in SDK types). Upgrade via `supabase.auth.updateUser({ email, password })` preserves UUID.

**Type Registry:** `src/lib/supabase.ts` is the canonical home for all DB-facing TypeScript types. Add new types here, not scattered in hooks or screens.

---

*Architecture analysis: 2026-05-05*
