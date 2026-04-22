# Codebase Concerns

**Analysis Date:** 2026-04-22

---

## Tech Debt

**Duplicate ShimmerCore definition:**
- Issue: `src/App.tsx` still contains an inline `const ShimmerCore` component (lines 9–23) defined locally, while `src/components/ShimmerCore.tsx` is the extracted canonical version. The inline copy is used by `WarRoom` inside `App.tsx` — the extracted `ShimmerCore.tsx` is never imported by `App.tsx`. Two divergent implementations now exist with different prop signatures (`distort` vs `staticLevel`) and slightly different geometry parameters.
- Files: `src/App.tsx`, `src/components/ShimmerCore.tsx`
- Impact: Any future changes to ShimmerCore geometry or props must be applied in two places. The inline version does not benefit from improvements made to the extracted component.
- Fix approach: Import `ShimmerCore` from `src/components/ShimmerCore.tsx` into `App.tsx`, remove the inline definition, and align the prop signature (rename `distort` prop → `staticLevel` to match the extracted version).

**`App.css` vestigial file (B-003 OPEN):**
- Issue: `src/App.css` contains 8 CSS rules and 6 media queries from the Vite template that are never applied. No file in `src/` imports it.
- Files: `src/App.css`
- Impact: Dead code. Minor confusion for future developers. No runtime impact.
- Fix approach: Delete `src/App.css`.

**`lucide-react` icons installed but unused (B-002 OPEN):**
- Issue: `lucide-react` is listed as a production dependency in `package.json` but is imported nowhere in `src/`. The four planned icons (Shield, Sparkles, Brain, Zap) were never rendered.
- Files: `package.json`
- Impact: Unnecessary bundle weight in the Vite build.
- Fix approach: Either wire the icons into the UI (EntryGate or WarRoom headers) or remove the dependency.

**SOS shell is a non-functional stub:**
- Issue: `SOSShell` in `src/App.tsx` (lines 83–99) contains a hardcoded `TODO: SOS onboarding / fitness module screens go here` comment. The component renders static copy and nothing else. The SOS/crisis flow routes here but there is no actual minimalist onboarding or fitness module to show.
- Files: `src/App.tsx`
- Impact: Users who tap SOS are shown a dead-end screen. This is the primary user-facing gap in the web shell.
- Fix approach: Wire `uiConfig === 'minimalist'` screens (basic activity selection, Hub-style timer) into `SOSShell`. Track as B-005 extension item.

**`DEPENDENCIES.docx` missing:**
- Issue: `AGENT.md` references a `DEPENDENCIES.docx` file for dependency documentation. This file does not exist in the repository.
- Files: `AGENT.md`
- Impact: Agent operating protocols reference a non-existent artifact.
- Fix approach: Create or remove the reference.

---

## Known Bugs

**Zero-Lazy Policy violations in Iron, Road, and Hub screens (B-005 OPEN):**
- Symptoms: Three screens contain acknowledged stub logic: `HubSession.tsx` has a comment "In a real app, we would save the session data here" (line 38) and does not persist sessions. `PushDayOnboarding.tsx` has console.log placeholder for skipped exercise persistence (line 416) and comment stubs for The Freeze and Sentinel Action protocols (lines 289, 326). `RoadSession.tsx` hardcodes the C25K manifest for all interval runs (line 26).
- Files: `src/native/screens/HubSession.tsx`, `src/native/screens/PushDayOnboarding.tsx`, `src/native/screens/RoadSession.tsx`
- Trigger: Any end-of-session save, exercise skip action, or multi-manifest road session
- Workaround: HubSession data is silently discarded. Skip tracking is logged to console only.

**Broken import path — `src/core/manifest` does not exist:**
- Symptoms: `FitnessOnboardingGrid.tsx` and `RoadSession.tsx` both import from `'../../core/manifest'`, but `src/core/` does not exist as a directory. The manifest data lives at `src/native/screens/manifest.ts`.
- Files: `src/native/screens/FitnessOnboardingGrid.tsx` (line 6), `src/native/screens/RoadSession.tsx` (line 5)
- Trigger: Any native build attempt will fail to resolve this import.
- Workaround: These files are excluded from the Vite/tsc build via `tsconfig.app.json` `"exclude": ["src/native"]`. The error is silent in the web build but will surface immediately when a native/Metro build is attempted.
- Fix approach: Either create `src/core/manifest.ts` and move the manifest there, or change both imports to `'../manifest'` (the correct relative path within `src/native/screens/`).

**`trickycardio()` HR readings count assumption is fragile:**
- Symptoms: The gate logic in `useTetherState.ts` (line 266) counts the number of `hr_readings` rows above threshold BPM as `minutesAtThreshold`, treating each row as exactly one minute of effort. There is no enforcement that readings are submitted at one-minute intervals — a client submitting 10 readings in 10 seconds would pass the 5-minute gate immediately.
- Files: `src/hooks/useTetherState.ts` (lines 265–267)
- Trigger: Any HR reading submission cadence other than exactly one-per-minute
- Fix approach: Use `recorded_at` timestamps to compute actual elapsed time above threshold rather than raw row count.

**`PushDayOnboarding` Dips exercise has no bodyweight-only 1RM path:**
- Symptoms: Dips is configured as `equipmentType: 'dips-station'` with a `weightKg` input field. For bodyweight-only sets, `weightKg` will be blank/zero, causing `calculate1RM(0, reps)` to return `0` (the guard `weightKg <= 0` short-circuits). The 1RM is silently not calculated or recorded for bodyweight dips.
- Files: `src/native/screens/PushDayOnboarding.tsx` (lines 126–133, `calculate1RM` line 56)
- Trigger: User logs Dips with no added weight
- Fix approach: Add a bodyweight flag or allow `weightKg` to default to estimated user bodyweight when blank for `dips-station` equipment type.

---

## Security Considerations

**Supabase environment variables not configured — no `.env.local` present:**
- Risk: `src/lib/supabase.ts` reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` directly from `import.meta.env` with no fallback or validation. If these are undefined, `createClient(undefined, undefined)` is called silently — the client will be created but every Supabase call will fail at runtime with cryptic errors rather than a clear "not configured" message.
- Files: `src/lib/supabase.ts` (lines 5–8)
- Current mitigation: None. No `.env.local` file exists in the repo root.
- Recommendations: Add a startup guard that throws a clear error if either env var is missing. Add `.env.local` to `.gitignore` (note: no `.gitignore` rule for `.env` was found in the checked sections).

**Edge function CORS allows all origins (`*`):**
- Risk: `supabase/functions/sync-workout/index.ts` and `supabase/functions/calculate-1rm/index.ts` set `Access-Control-Allow-Origin: *`. In production, this means any web origin can invoke these functions if they obtain a valid JWT.
- Files: `supabase/functions/sync-workout/index.ts` (line 20), `supabase/functions/calculate-1rm/index.ts`
- Current mitigation: Functions require a valid Bearer token, so unauthenticated abuse is blocked.
- Recommendations: Restrict `Allow-Origin` to the production domain before launch.

**`supabase.auth.getUser()` is called in `EntryGate` boot sequence, but the token is never validated server-side in the web app:**
- Risk: The web app trusts the client-side session from `getSession()`. For anonymous users this is low risk, but if the app ever adds privileged actions beyond RLS, this pattern would need server-side validation.
- Files: `src/components/EntryGate.tsx` (line 38)
- Current mitigation: Supabase RLS enforces `auth.uid()` checks on all tables.
- Recommendations: No immediate action for current anonymous-only scope.

---

## Performance Bottlenecks

**`bitchweights()` loads the entire `one_rm_history` for a profile:**
- Problem: The query in `useTetherState.ts` (line 185) selects all rows from `one_rm_history` for a user with no date limit, ordered ascending. As a user accumulates months of history, this becomes a large unbounded fetch.
- Files: `src/hooks/useTetherState.ts` (lines 184–192)
- Cause: No date filter; full history loaded client-side before filtering in JS.
- Improvement path: Add a server-side date filter of `recorded_at >= 6 weeks ago` and a secondary query for the baseline period only, reducing payload to two small window queries.

**`PushDayOnboarding` resolves exercise IDs on every mount:**
- Problem: Every time the Push Day screen mounts, it queries Supabase for exercise UUIDs by name (lines 167–199). For a screen visited frequently, this is a repeated network round-trip for static global data.
- Files: `src/native/screens/PushDayOnboarding.tsx` (lines 167–199)
- Cause: No caching layer; exercise IDs are not persisted.
- Improvement path: Cache exercise UUIDs in AsyncStorage or a global context after first successful resolve.

---

## Fragile Areas

**`EntryGate` has a potential auth race between `onAuthStateChange` and `boot()`:**
- Files: `src/components/EntryGate.tsx` (lines 15–54)
- Why fragile: `boot()` calls `getSession()` and then `signInAnonymously()` if no session is found. Simultaneously, `onAuthStateChange` fires `INITIAL_SESSION`. If `onAuthStateChange` fires with a session before `boot()` checks `getSession()`, `boot()` will still call `getSession()` — which returns the same session — and correctly short-circuits (line 39). However, if `signInAnonymously()` is called while `onAuthStateChange` is mid-fire with a valid INITIAL_SESSION, a duplicate sign-in attempt could occur.
- Safe modification: The comment on line 39 (`// onAuthStateChange already resolved it`) documents the guard, but the guard only works if the `getSession()` call resolves after `onAuthStateChange` has set the session in storage. The timing is Supabase-internal and generally reliable, but is not guaranteed under slow network conditions.
- Test coverage: No tests exist for this flow.

**`RoadSession` manifest selection is a simple `activityId.includes('interval')` string check:**
- Files: `src/native/screens/RoadSession.tsx` (line 35)
- Why fragile: Any `activityId` containing the substring `'interval'` — including future IDs like `'swim_interval'` or `'bike_interval_recovery'` — will always route to the C25K manifest regardless of the actual activity. The `else` branch hardcodes a generic steady-state manifest.
- Safe modification: Replace the string-includes check with an explicit lookup against `ROAD_ACTIVITIES` using the `sessionType` field (`'steady' | 'interval'`), then fetch the correct manifest per `activityId`.
- Test coverage: None.

**`FitnessOnboardingGrid` navigation reset uses `setTimeout(..., 500)`:**
- Files: `src/native/screens/FitnessOnboardingGrid.tsx` (lines 41–43, 69–72)
- Why fragile: State is reset via a 500ms timer after navigation. If the screen re-mounts faster than 500ms (e.g., fast back-press), the timer fires on an unmounted component, causing a React state update on an unmounted component warning. No cleanup of the timeout is performed.
- Safe modification: Use `useEffect` cleanup to cancel the timeout on unmount, or reset state in the screen's `focus` event listener.

**`useTetherState` `loadProfile` has no error boundary for the `upsert` on crisis mode trigger:**
- Files: `src/hooks/useTetherState.ts` (lines 120–138)
- Why fragile: `triggerCrisisMode()` silently swallows the error case — it logs to console via `agentLog` but returns nothing and leaves the UI in a gated state without user feedback. If the Supabase upsert fails (network error, RLS violation), the user is routed to SOS mode UI but their crisis state is not actually persisted.
- Safe modification: Return or throw the error from `triggerCrisisMode()` and surface a retry prompt in `EntryGate`.

---

## Scaling Limits

**Native build is entirely unrunnable in its current state:**
- Current capacity: Zero — the native layer (`src/native/`) cannot be built or run.
- Limit: `react-native`, `expo`, `@react-navigation/native`, `@react-navigation/native-stack`, and `react-native-safe-area-context` are not installed in `package.json`. There is no `app.json`, `app.config.ts`, or `metro.config.js`. `src/native/screens/FitnessOnboardingGrid.tsx` and `RoadSession.tsx` import from a non-existent `src/core/manifest` path.
- Scaling path: Install Expo SDK, create `app.json`, configure Metro, fix the import path, then test on simulator.

**`one_rm_history` has no index on `(profile_id, recorded_at)`:**
- Current capacity: Fast for small user datasets.
- Limit: The `bitchweights()` query scans the entire `one_rm_history` table filtered by `profile_id` without an index. Migration 02 defines the table but adds no indexes.
- Scaling path: Add `CREATE INDEX one_rm_history_profile_time ON one_rm_history (profile_id, recorded_at DESC)` in a future migration.

---

## Dependencies at Risk

**`react-native`, `expo`, `@react-navigation/*`, `react-native-safe-area-context` — not installed:**
- Risk: The entire `src/native/` layer has zero installable dependencies. These packages are referenced via import in 5 source files but are absent from `package.json`.
- Impact: Native build is impossible. Any CI check that compiles native files will fail.
- Migration plan: Run `npx create-expo-app` bootstrap or manually install `expo`, `react-native`, `@react-navigation/native`, `@react-navigation/native-stack`, `react-native-safe-area-context`, and `expo-haptics` (used in `MatSession.tsx`).

**`@supabase/supabase-js` is installed but requires runtime env configuration that is absent:**
- Risk: No `.env.local` exists. Every Supabase call on a fresh checkout will fail silently with an invalid client.
- Impact: `EntryGate`, `useTetherState`, `useJointOps`, and `PushDayOnboarding` all require a working Supabase client at first render.
- Migration plan: Document `.env.local` setup in README, add a startup guard in `src/lib/supabase.ts`.

---

## Missing Critical Features

**No Expo / native app entry point:**
- Problem: There is no `app.json`, `app.config.ts`, `metro.config.js`, or native entry point (`index.js` / `App.js` in the Expo convention). The project cannot be run as a mobile app at all.
- Blocks: Any mobile testing, device preview, or app store submission path.

**Hub, Road, and Mat sessions do not persist data:**
- Problem: `HubSession.tsx` discards session data on end. `RoadSession.tsx` shows a completion alert and goes back but writes nothing to Supabase. `MatSession.tsx` completes a pose sequence but does not record it.
- Blocks: Any user history, progress tracking, or cross-session analytics for three of the four domains.

**Skip exercise tracking is console.log only:**
- Problem: `PushDayOnboarding.tsx` (line 416) acknowledges that skipped exercises should be persisted and checked across sessions to trigger the `NoseyQuestionTime()` protocol, but only logs to console.
- Blocks: The adaptive training intelligence (Sentinel Actions, NoseyQuestionTime) that depends on multi-session skip patterns.

**The Freeze pain protocol is not implemented:**
- Problem: `PushDayOnboarding.tsx` (lines 326–333) contains a comment stating "The Freeze: In a real app, this would update a global state that the [next session] checks." Pain alerts are shown to the user but no volume/intensity reduction is persisted or enforced in subsequent sessions.
- Blocks: The injury-aware progressive overload system described in the build journal.

---

## Test Coverage Gaps

**Zero test infrastructure:**
- What's not tested: Everything. No test runner (jest, vitest), no test config, and no test files exist anywhere in the project.
- Files: All `src/` files
- Risk: Any refactor, type change, or logic update has no safety net. The 1RM calculation (`calculate1RM` in `PushDayOnboarding.tsx`) and `trickycardio`/`bitchweights` business logic are completely unverified by automated tests.
- Priority: High — the 1RM and cardio gate logic are mathematically critical and should have unit tests first.

**No integration tests for Supabase RLS policies:**
- What's not tested: The four migration files define RLS policies for 10+ tables. There are no tests verifying that a user cannot read another user's `one_rm_history`, `hr_readings`, or `op_checkpoints`.
- Files: `supabase/migrations/01_initial_schema.sql`, `supabase/migrations/02_fitness_schema.sql`, `supabase/migrations/03_joint_ops_schema.sql`, `supabase/migrations/04_hr_clash_schema.sql`
- Risk: An RLS misconfiguration would silently expose user health data across accounts.
- Priority: High — health and HR data has strong privacy expectations.

---

*Concerns audit: 2026-04-22*
