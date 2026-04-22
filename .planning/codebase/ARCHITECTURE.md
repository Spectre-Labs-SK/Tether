# Architecture

**Analysis Date:** 2026-04-22

## Pattern Overview

**Overall:** Dual-runtime hybrid — a React 19 + Vite web application (primary, runnable) coexists with stub React Native / Expo screen files. The web app follows a single-page shell pattern with state-machine-driven routing. Native screens exist in `src/native/screens/` but are not wired into any Expo entry point or navigator — they are standalone files intended for a future React Native build.

**Key Characteristics:**
- Single-file root component (`src/App.tsx`) drives top-level routing via a 3-state `AppMode` type
- Auth and profile state are owned by `EntryGate` + `useTetherState` before any other screen mounts
- All Supabase I/O flows through a single client instance in `src/lib/supabase.ts`
- Native screens import from `../../core/manifest` (a path that does not exist in the current tree), indicating they were written ahead of the directory structure they expect
- ShimmerMode (`MILITARY` | `ETHER`) is a cross-cutting concern defined in `src/registry/valkyrie/houses.ts` and consumed by both web and native code

## Layers

**Web Shell (Presentation):**
- Purpose: Root routing and aesthetic-mode switching
- Location: `src/App.tsx`
- Contains: `App` (top-level router), `WarRoom` (calibrated post-auth view), `SOSShell` (crisis placeholder), inline `ShimmerCore` 3D component
- Depends on: `src/components/EntryGate.tsx`, `src/index.css`
- Used by: `src/main.tsx` (browser entry point)

**Components:**
- Purpose: Reusable UI building blocks
- Location: `src/components/`
- Contains: `EntryGate.tsx` (split-screen auth gate with kill switch), `ShimmerCore.tsx` (extracted Three.js mesh component)
- Depends on: `src/lib/supabase.ts`, `src/hooks/useTetherState.ts`, `src/lib/agentLog.ts`, `src/registry/valkyrie/manifest.ts`
- Used by: `src/App.tsx`

**Hooks (State / Business Logic):**
- Purpose: Encapsulate async state, Supabase queries, and domain logic
- Location: `src/hooks/`
- Contains:
  - `useTetherState.ts` — profile loading, crisis mode state machine, `bitchweights()` (stagnation detector), `trickycardio()` (pre-lift HR gate)
  - `useJointOps.ts` — collaborative ops CRUD, clash state management, HR sync
- Depends on: `src/lib/supabase.ts`, `src/lib/agentLog.ts`
- Used by: `src/components/EntryGate.tsx` (useTetherState); native screens consume these indirectly when wired

**Library (Infrastructure):**
- Purpose: Singleton clients and utility exports
- Location: `src/lib/`
- Contains:
  - `supabase.ts` — `createClient()` singleton, all TypeScript type definitions for DB rows (`Profile`, `LifeSectors`, `JointOp`, `OpMember`, `OpCheckpoint`, `HRReading`, `OpHRSync`)
  - `agentLog.ts` — thin console wrapper with `[Agent_Architect]` / `[Agent_Valkyrie]` prefixes
- Depends on: `@supabase/supabase-js`, Vite env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- Used by: all hooks and components

**Registry (Domain Data / Config):**
- Purpose: Static manifests and type definitions for the Shimmer / Valkyrie system
- Location: `src/registry/valkyrie/`
- Contains:
  - `manifest.ts` — `VALKYRIE_MANIFEST` (gear catalogue, Push Day exercise list), `ValkyrieExercise` type
  - `houses.ts` — `RONIN_HOUSES` registry, `ShimmerMode` type, `RoninHouse` type
- Depends on: nothing (pure data)
- Used by: `src/components/EntryGate.tsx`, `src/native/screens/PushDayOnboarding.tsx`, `src/native/screens/FitnessOnboardingGrid.tsx`

**Native Screens (React Native / Expo — stub layer):**
- Purpose: Future Expo mobile build; activity session UIs
- Location: `src/native/screens/`
- Contains:
  - `FitnessOnboardingGrid.tsx` — 2-step domain/activity selector, owns `RootStackParamList`
  - `PushDayOnboarding.tsx` — workout logger with inline 1RM calculation (Epley, Brzycki, Lander consensus)
  - `RoadSession.tsx` — interval/cardio timer consuming C25K manifest
  - `MatSession.tsx` — yoga pose countdown with haptics (`Vibration`)
  - `HubSession.tsx` — desk session up-time and postural reset tracker
  - `manifest.ts` — domain/activity registry (`DOMAINS`, `IRON_ACTIVITIES`, `ROAD_ACTIVITIES`, etc.) — **currently misplaced**: screens import from `../../core/manifest` but this file lives at `src/native/screens/manifest.ts`
- Depends on: React Native, `@react-navigation/native`, `react-native-safe-area-context`, `src/registry/valkyrie/`, `src/lib/supabase.ts`
- Used by: nothing (not wired to any navigator entry point)

**Supabase Backend:**
- Purpose: Persistent storage, auth, and server-side compute
- Location: `supabase/`
- Contains:
  - `migrations/01_initial_schema.sql` — `profiles`, `life_sectors` tables, RLS, `updated_at` trigger
  - `migrations/02_fitness_schema.sql` — fitness/workout tables
  - `migrations/03_joint_ops_schema.sql` — `joint_ops`, `op_members`, `op_checkpoints` tables, RLS
  - `migrations/04_hr_clash_schema.sql` — `hr_readings`, `op_hr_sync`, `clash_state` column on `joint_ops`
  - `functions/calculate-1rm/index.ts` — Deno edge function: POST receives `weightKg`/`reps`, returns all three formula results + consensus
  - `functions/sync-workout/index.ts` — Deno edge function: syncs workout data to DB

## Data Flow

**App Boot / Auth Flow:**

1. `src/main.tsx` mounts `<App />` in StrictMode
2. `App` renders `<EntryGate onEnter={setAppMode} />` (initial `appMode === 'gate'`)
3. `EntryGate` calls `supabase.auth.onAuthStateChange` to restore or create an anonymous session
4. On session resolve, `EntryGate` calls `useTetherState(userId)` which loads/bootstraps the `profiles` row
5. User selects "Chill Mode" → `onEnter('chill')` → `App` renders `<WarRoom />`
6. User selects "SOS Mode" → `triggerCrisisMode()` writes `is_crisis_mode=true` to Supabase → `onEnter('sos')` → `App` renders `<SOSShell />`

**Crisis Mode State Machine:**

1. `is_crisis_mode = false` → `uiConfig = 'full'`
2. SOS button triggers `triggerCrisisMode()` → DB upsert sets `is_crisis_mode=true, onboarding_pending=true`
3. `uiConfig` derives to `'minimalist'`
4. `exitCrisisMode()` sets `is_crisis_mode=false` → `uiConfig` returns to `'full'`

**Native Session Flow (intended, not wired):**

1. `FitnessOnboardingGrid` → tap domain → tap activity
2. Navigate to domain-specific session screen (`PushDayOnboarding`, `RoadSession`, `MatSession`, `HubSession`)
3. Session screen writes workout/HR data to Supabase via `supabase` client or edge function
4. Return to `FitnessOnboardingGrid` on completion

**State Management:**
- No global state store (no Redux, Zustand, Context). All state is local `useState` or derived from Supabase queries in custom hooks.
- `useTetherState` is the closest thing to global app state — it owns `profile` and all crisis mode logic.
- `useJointOps` manages collaborative ops state independently, scoped by `userId`.

## Key Abstractions

**ShimmerMode:**
- Purpose: Two-value aesthetic token (`'MILITARY'` | `'ETHER'`) that drives color and material choices across all UI
- Examples: `src/registry/valkyrie/houses.ts`, `src/lib/supabase.ts` (`JointOp.shimmer_mode`), `src/native/screens/PushDayOnboarding.tsx`
- Pattern: Passed as a prop or stored in DB; never derived at runtime

**VALKYRIE_MANIFEST:**
- Purpose: Central static registry for gear (cosmetic items) and training program (exercises, sets/reps)
- Examples: `src/registry/valkyrie/manifest.ts`
- Pattern: `as const` object — all consumers read typed properties, no mutations

**Domain / Activity Registry (DOMAINS):**
- Purpose: Defines the four activity domains and their child activities; drives `FitnessOnboardingGrid` UI
- Examples: `src/native/screens/manifest.ts` (`DOMAINS`, `IRON_ACTIVITIES`, `ROAD_ACTIVITIES`, etc.)
- Pattern: Static arrays consumed by the grid component; domain name is the routing key

**Random Handle:**
- Purpose: Zero-friction anonymous identity for SOS users — generated client-side, stored in `profiles.random_handle`
- Examples: `src/hooks/useTetherState.ts` (`generateRandomHandle()`)
- Pattern: Generated on profile bootstrap; surfaced as read-only display in `EntryGate`

**agentLog:**
- Purpose: Structured console logging with agent identity prefix; two channels: `architect` and `valkyrie`
- Examples: `src/lib/agentLog.ts`
- Pattern: `agentLog.architect(msg)` for system/infra events; `agentLog.valkyrie(msg)` for motivational/UX messages

## Entry Points

**Web Application:**
- Location: `src/main.tsx`
- Triggers: Browser loads `index.html` → Vite serves bundle
- Responsibilities: Mounts `<App />` into `#root` DOM node under React StrictMode

**Web Root Component:**
- Location: `src/App.tsx`
- Triggers: Rendered by `main.tsx`
- Responsibilities: Top-level `AppMode` state (`gate` | `chill` | `sos`), routes to `EntryGate`, `WarRoom`, or `SOSShell`

**Native Root (not yet implemented):**
- Expected location: `src/native/App.tsx` or project root `App.tsx` (Expo convention) — does not exist
- The `RootStackParamList` is defined in `src/native/screens/FitnessOnboardingGrid.tsx` but no navigator wrapping it exists

**Supabase Edge Functions:**
- `supabase/functions/calculate-1rm/index.ts` — POST `/functions/v1/calculate-1rm`
- `supabase/functions/sync-workout/index.ts` — POST `/functions/v1/sync-workout`

## Error Handling

**Strategy:** Optimistic with graceful degradation. Auth failure falls through to an "untracked" state rather than blocking the app. All Supabase calls check `error` and log via `agentLog.architect` but rarely surface errors to the UI.

**Patterns:**
- Auth unavailable → `setAuthReady(true)` with `userId = null`; `isUntracked` flag warns consumer
- Supabase query error → `agentLog.architect(error.message)`, return empty array or null
- Edge function validation → HTTP 422 with JSON error body; no frontend retry logic present

## Cross-Cutting Concerns

**Logging:** `agentLog` from `src/lib/agentLog.ts` — two channels (`architect`, `valkyrie`). Used in all hooks and `EntryGate`. Not used in native screens (except `PushDayOnboarding` which imports `supabase` but not `agentLog`).

**Validation:** Input validation is performed inside edge functions (`calculate-1rm`, `sync-workout`) via explicit type checks and range guards. Client-side validation is minimal.

**Authentication:** Supabase anonymous auth (`signInAnonymously()`). Session is restored from localStorage via `onAuthStateChange('INITIAL_SESSION')`. Kill switch (`supabase.auth.signOut()`) is exposed in `EntryGate` for Feu Follet Charter compliance.

---

*Architecture analysis: 2026-04-22*
