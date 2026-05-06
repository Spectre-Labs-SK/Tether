# Technical Concerns

**Last mapped:** 2026-05-05

---

## Critical (blocks shipping)

### Migrations 05 and 06 not applied to production

- **Issue:** `supabase/migrations/05_identity_upgrade.sql` (adds `is_registered` to profiles) and `supabase/migrations/06_tether_state_and_hub_sessions.sql` (adds `is_nightmare_active`, `theme_state` to profiles; creates `hub_sessions` table) were written to disk but never pushed to the remote Supabase instance.
- **Files:** `supabase/migrations/05_identity_upgrade.sql`, `supabase/migrations/06_tether_state_and_hub_sessions.sql`
- **Impact:** `useTetherState` reads `is_nightmare_active` and `theme_state` via `toTetherState()` which supplies safe defaults — so the web app renders but data is silently wrong. `HubSession.tsx` inserts to `hub_sessions` which does not yet exist on the live DB, causing runtime errors on session save. `is_registered` column missing causes UPSERT failures on profile creation for any code that writes it.
- **Fix:** Run `supabase db push` or apply migrations manually via the Supabase dashboard. Verify with `supabase db diff` first.

### `RootStackParamList` duplicated across three files — type drift risk

- **Issue:** The navigator type is defined in three separate places:
  - `src/native/screens/FitnessOnboardingGrid.tsx` (lines 10–17) — full 6-route definition, used by `NativeApp.tsx` import
  - `src/native/screens/PushDayOnboarding.tsx` (lines 66–69) — 2-route subset
  - `src/native/navigation.types.ts` (lines 3–9) — full 6-route definition (canonical file created but not wired)
- **Files:** `src/native/screens/FitnessOnboardingGrid.tsx`, `src/native/screens/PushDayOnboarding.tsx`, `src/native/navigation.types.ts`
- **Impact:** `NativeApp.tsx` imports `RootStackParamList` from `FitnessOnboardingGrid.tsx` (not `navigation.types.ts`), so the canonical file is orphaned. `PushDayOnboarding.tsx` uses its own 2-route subset — if a new screen is added to the navigator it won't appear in PushDay's type. Navigation errors at runtime will occur if PushDay tries to navigate to a screen not in its local list. Type drift is silent — TypeScript will not error because each file is internally consistent.
- **Fix:** Delete the `RootStackParamList` from `FitnessOnboardingGrid.tsx` and `PushDayOnboarding.tsx`. Update `NativeApp.tsx` to `import type { RootStackParamList } from './navigation.types'`. All screen files import from the same canonical source.

### `process.env` in `supabase.ts` causes TS2591 in the web build

- **Issue:** `src/lib/supabase.ts` uses `process.env.EXPO_PUBLIC_SUPABASE_URL` and `process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY`. The web tsconfig (`tsconfig.app.json`) includes `"node"` in `types[]` which resolves this for now via `@types/node`. However, the correct Vite pattern is `import.meta.env.*`. If `"node"` is ever removed from `tsconfig.app.json`, both lines will produce TS2591 errors. The Vite `define` block in `vite.config.ts` maps `process.env.*` to the equivalent `import.meta.env.*` values, so this works at runtime — but it is an unusual cross-bundler pattern.
- **File:** `src/lib/supabase.ts` (lines 9–10)
- **Impact:** Currently non-breaking because `@types/node` is in `devDependencies` and `"node"` is in `tsconfig.app.json`. Fragile if tsconfig is cleaned up.
- **Fix:** Replace `process.env.EXPO_PUBLIC_*` with a pattern that is valid in both runtimes without requiring `@types/node` in the web build. One option: feature-detect `import.meta?.env?.*` with a `process.env.*` fallback guarded by `typeof process !== 'undefined'`.

---

## High (significant tech debt)

### `useBunkerTap` hook is implemented but has no consumer

- **Issue:** `src/hooks/useBunkerTap.ts` defines the `BUNKER_SEQUENCE [1,2,1]` tap-sequence detection hook. No file in `src/` imports it — verified by grep.
- **Files:** `src/hooks/useBunkerTap.ts`
- **Impact:** The Bunker Gate calibration screen in `WarRoom.tsx` has no tap-sequence unlock mechanism. The intended feature (secret tap pattern to enter the bunker calibration overlay) is simply absent in the web shell. The hook itself is correct and ready to use.
- **Fix:** Import and wire `useBunkerTap` into `src/components/BunkerGate.tsx` (the calibration gate in WarRoom). Map three screen regions (left / right / left) to `registerTap(1)`, `registerTap(2)`, `registerTap(1)` on press events.

### `shimmerMode` state lives only in `WarRoom` — not persisted to DB

- **Issue:** `shimmerMode` is `useState<"MILITARY" | "ETHER">("MILITARY")` local to `src/components/WarRoom.tsx` (line 21). The DB schema (`profiles.theme_state`) and `useTetherState.updateTheme()` exist to persist the user's chosen mode, but `WarRoom` never calls `updateTheme` when the mode is toggled. `shimmerMode` is also independently initialized from the hardcoded `"MILITARY"` default rather than from `state?.theme_state`.
- **Files:** `src/components/WarRoom.tsx` (lines 21, 215)
- **Impact:** User's shimmer mode preference is lost on every page refresh. The `updateTheme` API exists and the DB column exists but are silently ignored.
- **Fix:** Initialize `shimmerMode` from `state?.theme_state ?? 'MILITARY'` after profile loads. Call `updateTheme(newMode)` inside the toggle handler on line 215.

### `WorkoutSummary` native screen is a shell — no data wiring

- **Issue:** `src/native/screens/WorkoutSummary.tsx` receives `workoutId` via route params and displays it as a raw UUID string. No Supabase queries fetch the actual workout data (exercise names, sets, 1RM PRs). The screen is a navigation stub only.
- **Files:** `src/native/screens/WorkoutSummary.tsx`
- **Impact:** Post-workout summary is effectively useless. Users see a UUID, not their results. The 1RM PR data computed by `sync-workout` edge function is never surfaced.
- **Fix:** Add a `useEffect` that fetches the workout and its sets from Supabase using `workoutId`. Display exercise names, completed sets, and any new PRs returned from `sync-workout`.

### `synthesizeDay` has no UI consumer

- **Issue:** `src/logic/synthesis/nightlySynth.ts` implements the full daily plan aggregation pipeline (`synthesizeDay(userId, date)`). No screen, hook, or component in the codebase imports or calls it.
- **Files:** `src/logic/synthesis/nightlySynth.ts`, `src/logic/synthesis/index.ts`
- **Impact:** The synthesis layer is dead code. Daily plan events, checkpoint due dates, and HR peak data are computed but never shown to the user. This is the intended "intelligence layer" of the product.
- **Fix:** Wire `synthesizeDay` into a new hook (e.g., `useDailyPlan`) consumed by `WarRoom` or a dedicated Plan screen. This is a planned feature — track as a roadmap phase, not a bug.

### `1RM formula logic duplicated` between edge function and native screen

- **Issue:** The Epley/Brzycki/Lander 1RM formulas are implemented twice in identical form:
  - `supabase/functions/sync-workout/index.ts` (lines 29–47, `consensus1RM`)
  - `src/native/screens/PushDayOnboarding.tsx` (lines 33–59, `calculate1RM` exported)
- **Files:** `supabase/functions/sync-workout/index.ts`, `src/native/screens/PushDayOnboarding.tsx`
- **Impact:** Formula drift risk — if the calculation is tuned in one place, the other diverges silently. Currently identical, so no user-facing impact.
- **Fix:** The Deno edge function cannot share Node/browser modules, so duplication is architecturally required across the boundary. Document this explicitly in both files with a comment pointing to the other location. A shared test fixture can verify parity.

### `agentLog` outputs via bare `console.log` — no structured logging

- **Issue:** `src/lib/agentLog.ts` (lines 2–3) is a thin wrapper over `console.log`. All `agentLog.architect()` and `agentLog.valkyrie()` calls in production builds output to the browser console. There is no log level control, no filtering, no production vs. development guard.
- **Files:** `src/lib/agentLog.ts`
- **Impact:** Production builds will log internal system messages to any user who opens DevTools. Verbose output pollutes the console in a way that could expose business logic or system state details. Low security risk but poor operational hygiene.
- **Fix:** Add a `NODE_ENV` guard so `agentLog` calls are no-ops in production. Alternatively gate on a `VITE_DEBUG_LOGS` env flag.

---

## Medium (should address)

### Native screens use bare `console.error` / `console.warn` — violates logging convention

- **Issue:** `src/native/screens/HubSession.tsx` (lines 49, 52), `src/native/screens/RoadSession.tsx` (line 53), and `src/native/screens/PushDayOnboarding.tsx` (lines 298, 301, 347, 350, 352, 447, 449, 452, 473) use `console.error` and `console.warn` directly instead of `agentLog.architect()`.
- **Files:** `src/native/screens/HubSession.tsx`, `src/native/screens/RoadSession.tsx`, `src/native/screens/PushDayOnboarding.tsx`
- **Impact:** Inconsistent logging. Error events from native screens are not captured in the same format as web shell errors. Low functional impact — native Metro logging is separate from web console anyway.
- **Fix:** Replace `console.error`/`console.warn` calls with `agentLog.architect()`. Import `agentLog` at the top of each native screen.

### `RoadSession` hardcodes C25K manifest — `activityId` routing is a stub

- **Issue:** `src/native/screens/RoadSession.tsx` (line 24) contains a comment: `"For now, we'll hardcode the C25K manifest for any interval run."` The `activityId` param is received but only used to check `activityId.includes('interval')`. Non-interval activities get a hardcoded 40-min steady-state fallback.
- **Files:** `src/native/screens/RoadSession.tsx`
- **Impact:** Any Road domain activity other than C25K Week 1 Day 1 will receive incorrect workout data. The manifest routing system is incomplete.
- **Fix:** Expand `src/native/screens/manifest.ts` with additional interval plans. Add a `getManifestForActivity(activityId)` lookup function. Replace the hardcoded branch in `RoadSession`.

### `MatSession` ignores `activityId` — single hardcoded yoga flow

- **Issue:** `src/native/screens/MatSession.tsx` (line 44) has a `// TODO Phase 2` comment: all Mat activities use `YOGA_FLOW_MANIFEST` regardless of `activityId`. The dependency on `activityId` is explicitly removed from the `useEffect` dep array.
- **Files:** `src/native/screens/MatSession.tsx`
- **Impact:** Mat domain has no activity differentiation. All sessions run the same 7-pose flow. The TODO acknowledges this.
- **Fix:** Add additional flows to a manifest lookup keyed by `activityId`. Select the appropriate flow in the `useEffect`.

### `ShimmerCore` ref cast uses `as unknown as any`

- **Issue:** `src/components/ShimmerCore.tsx` (line 49) has `ref={materialRef as unknown as any}` with a suppressed ESLint comment on line 48 (`// eslint-disable-next-line @typescript-eslint/no-explicit-any`). The cast is required because `DistortMaterialImpl` is not exported from `@react-three/drei`.
- **Files:** `src/components/ShimmerCore.tsx` (lines 48–49)
- **Impact:** If the `@react-three/drei` API changes the internal type, the cast will silently pass TypeScript but produce a runtime error. The `eslint-disable` also bypasses the no-explicit-any rule.
- **Fix:** Check if newer `@react-three/drei` versions export `DistortMaterialImpl`. If not, define a local `type DistortMaterial = THREE.MeshPhysicalMaterial & { distort: number; speed: number }` and cast to that instead of `any`.

### `FitnessOnboardingGrid` (native) shows `Alert.alert('Coming Soon')` for non-Push Iron activities

- **Issue:** `src/native/screens/FitnessOnboardingGrid.tsx` (line 57): Iron domain activities other than `push` navigate to `Alert.alert('Coming Soon', ...)`. This is an acknowledged stub.
- **Files:** `src/native/screens/FitnessOnboardingGrid.tsx`
- **Impact:** Pull Day, Leg Day, and accessory Iron activities are not implemented. Users selecting them see a native alert, not a workout session.
- **Fix:** Implement Pull Day and Leg Day screens (or a generic `IronSession` screen with configurable exercise manifests). Route by `activity.id` in the switch statement.

### `WarRoom` calls `supabase.from('profiles').update()` directly — bypasses `useTetherState.sync`

- **Issue:** `src/components/WarRoom.tsx` (lines 36–48) in `handleCompleteOnboarding` makes a direct Supabase call to update `onboarding_pending` then calls `sync()` manually. This pattern duplicates the DB-first update logic that belongs in `useTetherState` or a domain hook.
- **Files:** `src/components/WarRoom.tsx`
- **Impact:** Any future changes to the `onboarding_pending` update logic (e.g., adding a timestamp, triggering a side-effect) must be made in two places. Breaks the architectural rule that DB writes route through the hook layer.
- **Fix:** Add a `completeOnboarding()` method to `TetherStateReturn` in `useTetherState.ts`. Call it from `WarRoom` rather than making a raw Supabase call.

---

## Low (nice to have)

### `lucide-react` in `dependencies` but no imports in `src/`

- **Issue:** `lucide-react@^1.8.0` is listed in `package.json` `dependencies` (not `devDependencies`). Zero `import` statements from `lucide-react` exist anywhere in `src/`. Tracked as B-008 in the journal — deliberate deferral for icon placement.
- **Files:** `package.json` (line 26)
- **Impact:** ~280KB added to the production bundle by the dependency declaration alone (tree-shaking only applies if there are actual imports). No functional impact while unused.
- **Fix:** Either add intentional `lucide-react` icon imports (e.g., in WarRoom header, SOSShell) or remove the dependency until needed. Do not arbitrarily render icons to close the bug.

### `get-shit-done@^0.0.2` in production `dependencies`

- **Issue:** `package.json` lists `get-shit-done@^0.0.2` under `dependencies`, not `devDependencies`.
- **Files:** `package.json` (line 25)
- **Impact:** This is a dev tooling package (`npx get-shit-done-cc`). It increases the production bundle footprint unnecessarily if bundled, though Vite/Metro will tree-shake it if there are no imports. Should be in `devDependencies`.
- **Fix:** Move `get-shit-done` to `devDependencies`.

### `navigation.types.ts` exists but is not used — creates a false sense of consolidation

- **Issue:** `src/native/navigation.types.ts` was created as the canonical single-source `RootStackParamList`, but `NativeApp.tsx` still imports from `FitnessOnboardingGrid.tsx`. The file is effectively dead.
- **Files:** `src/native/navigation.types.ts`, `src/native/NativeApp.tsx` (line 3)
- **Impact:** Low — the type is functionally defined elsewhere. But any developer (or AI agent) reading `navigation.types.ts` will assume it is the source of truth when it is not.
- **Fix:** Resolve as part of the RootStackParamList consolidation described in the Critical section.

### `is_anonymous` property cast is fragile — not in SDK types

- **Issue:** Two files cast `session.user` to include `is_anonymous?: boolean` using `as { is_anonymous?: boolean }`:
  - `src/components/EntryGate.tsx` (line 35)
  - `src/components/WarRoom.tsx` (line 62)
  The property exists in the Supabase JWT but is absent from `@supabase/supabase-js` TS types.
- **Files:** `src/components/EntryGate.tsx`, `src/components/WarRoom.tsx`
- **Impact:** If Supabase SDK eventually adds `is_anonymous` to the type (with a different shape), the cast will mask the correct type. Non-breaking today.
- **Fix:** Centralize the cast into a helper: `function isAnonymousUser(user: User): boolean { return (user as unknown as { is_anonymous?: boolean }).is_anonymous ?? false; }` in `src/lib/supabase.ts`. Import it in EntryGate and WarRoom.

---

## Security

### Edge function CORS allows all origins (`Access-Control-Allow-Origin: *`)

- **Issue:** `supabase/functions/sync-workout/index.ts` (line 21) sets `'Access-Control-Allow-Origin': '*'`.
- **Files:** `supabase/functions/sync-workout/index.ts`
- **Impact:** Any origin can call the edge function. Supabase edge functions require a valid user JWT (the function validates the Bearer token), so unauthenticated cross-origin requests are blocked at the auth layer. CORS is a secondary concern here. Low actual risk but worth tightening for production.
- **Fix:** Restrict `Access-Control-Allow-Origin` to the app's production domain (e.g., `https://tether.spectrelabs.dev`). Maintain a development override for local testing.

### Service role key used in `sync-workout` — ownership guard is manual

- **Issue:** `supabase/functions/sync-workout/index.ts` (line 134) creates a Supabase client using `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS. The function manually validates that `workoutOwner.profile_id === profileId` (lines 149–151) to prevent cross-user data access.
- **Files:** `supabase/functions/sync-workout/index.ts`
- **Impact:** The ownership check is correct, but it is a manual guard rather than a schema-enforced one. Any future modification to this function that adds additional queries must remember to re-apply the ownership filter. A missed filter would expose any user's data.
- **Fix:** Document this explicitly with a `// SECURITY: manual ownership guard — service role bypasses RLS` comment at each query. Consider refactoring to use a user-scoped client for queries that are naturally RLS-protected, reserving the service role client only for the `one_rm_history` upsert.

### Anonymous session data permanently linked to UUID — no data retention policy

- **Issue:** Anonymous sessions create permanent UUID-linked records in `profiles`, `workouts`, `workout_sets`, `hr_readings`, and `op_checkpoints`. There is no TTL, cleanup job, or data retention policy for unclaimed anonymous sessions.
- **Files:** `src/components/BunkerGate.tsx`, `src/components/EntryGate.tsx`, `supabase/migrations/01_initial_schema.sql`
- **Impact:** DB accumulates indefinitely growing orphaned rows for any user who tries the app anonymously and never upgrades. No PII risk (handles are random), but storage cost grows unbounded.
- **Fix:** Add a Supabase scheduled function (pg_cron) or a manual cleanup query that deletes profiles where `is_registered = false` and `created_at < NOW() - INTERVAL '30 days'`. Cascade deletes handle linked tables.

---

## Performance

### `synthesizeDay` issues N+1 queries — one `workout_sets` fetch per workout

- **Issue:** `src/logic/synthesis/nightlySynth.ts` (lines 78–98) fetches `workout_sets` inside a `for` loop over workouts. For a user with 10 workouts on a given day, this is 11 round-trips (1 workouts query + 10 sets queries).
- **Files:** `src/logic/synthesis/nightlySynth.ts`
- **Impact:** Synthesis latency scales linearly with the number of daily workouts. Acceptable for a single user. Problematic if daily plan generation is ever batched or used in a background job.
- **Fix:** Fetch all `workout_sets` for all workout IDs in a single `.in('workout_id', workoutIds)` query, then group by `workout_id` in memory before the loop.

### `useArmory.bitchweights` fetches full `one_rm_history` — no date filter

- **Issue:** `src/hooks/useArmory.ts` (line 24) fetches all `one_rm_history` rows for the user with `.order('recorded_at', { ascending: true })` — no upper or lower date bound. For a user with years of history this is an unbounded table scan.
- **Files:** `src/hooks/useArmory.ts`
- **Impact:** Query size grows with usage. A user with 52 weeks of data will fetch 52x more rows than necessary (only 6 weeks of baseline + 6 weeks of recent data are needed).
- **Fix:** Add a `.gte('recorded_at', twelveWeeksAgo.toISOString())` filter so only the relevant window is fetched.

### `ShimmerCore` allocates a `THREE.Color` per render frame (partially mitigated)

- **Issue:** `src/components/ShimmerCore.tsx` pre-allocates `_targetColor` at module scope (line 11) to avoid allocating `new THREE.Color()` inside `useFrame`. This is correct. However, `mat.color.lerp(_targetColor, LERP)` at line 40 still creates intermediate color objects via Three.js internals.
- **Files:** `src/components/ShimmerCore.tsx`
- **Impact:** Low. The mitigation is effective for the direct user code. Three.js internal allocations are outside the developer's control at this level. Acceptable for 60fps target.
- **Fix:** No action required at current scale. Note for future profiling pass if frame budget becomes tight.

---

## Fragile Areas

### `toTetherState()` supplies defaults for DB columns that don't exist yet

- **Issue:** `src/hooks/useTetherState.ts` (lines 66–79) maps raw Supabase rows to `TetherState` via `toTetherState()`. It uses `raw.is_nightmare_active ?? false` and `(raw.theme_state as ValkyrieTheme | undefined) ?? 'MILITARY'` as defaults for columns that migration 06 adds. Until migration 06 is applied, every profile read silently returns default values for these fields regardless of what the user has set.
- **Files:** `src/hooks/useTetherState.ts`
- **Impact:** When migration 06 is applied and real data starts being written, existing cached sessions will still see defaults until the user's profile is re-fetched. No data corruption — just a one-session stale read.
- **Safe modification:** Do not remove the `?? false` / `?? 'MILITARY'` defaults. They are the correct defensive pattern. The fix is to apply the migration.

### `BunkerGate` auth has a 3-second hard timeout with no retry

- **Issue:** `src/components/BunkerGate.tsx` (line 6) sets `AUTH_TIMEOUT_MS = 3000`. If anonymous sign-in takes more than 3 seconds (e.g., on a slow mobile connection), the gate transitions to `offline` mode and the user proceeds without a session. The `onAuthStateChange` subscription remains active and will still fire if auth resolves after the timeout — but `setConn` uses a functional update that checks `prev === 'connecting'` to prevent an `offline→online` flip.
- **Files:** `src/components/BunkerGate.tsx`
- **Impact:** On slow connections, legitimate users get permanently locked into offline/untracked mode for the session. Auth state is not retried. The 3-second threshold is aggressive for mobile networks.
- **Safe modification:** Increase `AUTH_TIMEOUT_MS` to `8000`–`10000` for mobile. Add a "Retry Connection" button in the offline state that triggers a fresh `signInAnonymously()` call.

### `WarRoom` `handleSignOut` is `async` but `onSignOut` prop is called before `signOut` resolves

- **Issue:** `src/components/WarRoom.tsx` (lines 117–122): `handleSignOut` awaits `supabase.auth.signOut()` before calling `onSignOut()`. This is correct. However, `onSignOut()` in `App.tsx` resets `appMode` to `'gate'` which unmounts `WarRoom` — if `signOut` throws or is slow, the component may be mid-teardown when the error surfaces. The `await` ensures sequential execution, so this is more of a latency concern than a correctness bug.
- **Files:** `src/components/WarRoom.tsx` (lines 117–122), `src/App.tsx` (lines 130–133)
- **Impact:** Low. The pattern is consistent with the Ethics Charter requirement (user must be able to sign out even if Supabase is slow). The pattern in `triggerKillSwitch` (fire-and-forget async) is actually the more resilient approach here.
- **Safe modification:** Consider aligning `handleSignOut` with `triggerKillSwitch` pattern: clear local state immediately, then fire `signOut` async without awaiting. This prevents UI hang if Supabase is unreachable.

### `nightlySynth.ts` uses `as string` casts throughout — no runtime validation

- **Issue:** `src/logic/synthesis/nightlySynth.ts` casts Supabase query results with `as string`, `as string | null`, `as number | undefined` etc. throughout (lines 75, 85–92, 111–120, 136–150). The Supabase JS client returns `unknown` column types when no generated types are used.
- **Files:** `src/logic/synthesis/nightlySynth.ts`
- **Impact:** If the DB schema returns unexpected null, string, or type mismatch, the TypeScript casts suppress the error and pass corrupt data to the `DailyPlan` output. No runtime validation guards the cast.
- **Fix:** Generate Supabase TypeScript types via `supabase gen types typescript --local > src/types/supabase.ts`. Use the generated types for query result shapes instead of manual casts. This is the medium-term hardening path for the synthesis layer.

---

*Concerns audit: 2026-05-05*
