# Codebase Concerns

**Analysis Date:** 2026-05-05

---

## Critical (Blockers)

### ~~C-001: No .env.local~~ RESOLVED 2026-04-27
`.env.local` exists with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Supabase client initialises correctly in both Vite and Metro builds.

### ~~C-002: React Native screens have no build system~~ RESOLVED 2026-05-03
Expo SDK 55 installed, `app.json`/`babel.config.js`/`metro.config.cjs`/`index.js` present. CNG architecture in place. EAS Build target confirmed.

### ~~C-003: ShimmerCore defined twice~~ RESOLVED 2026-04-27

### C-020: Migration 06 written but not yet applied to production DB
- Issue: `supabase/migrations/06_tether_state_and_hub_sessions.sql` adds `is_nightmare_active`, `theme_state` columns to `profiles` and creates the `hub_sessions` table. It has not been applied to the live Supabase project.
- Files: `supabase/migrations/06_tether_state_and_hub_sessions.sql`, `src/hooks/useTetherState.ts`, `src/native/screens/HubSession.tsx`
- Impact: `HubSession.tsx` `INSERT` into `hub_sessions` will fail with relation-not-found at runtime. `useTetherState` reads `theme_state`/`is_nightmare_active` from the DB — queries succeed but columns return NULL, forcing the `toTetherState()` default path (`'MILITARY'`, `false`) every time, meaning theme preferences are never persisted.
- Fix: Run `supabase db push` or apply migration manually via Supabase Dashboard SQL editor.

---

## High Priority

### C-005: Zero automated tests
- Issue: No test framework installed. No test files exist in `src/` (confirmed — zero `*.test.ts`, `*.spec.ts` files). Business-critical logic (`calculate1RM` formulas in `src/native/screens/PushDayOnboarding.tsx`, synthesis aggregation in `src/logic/synthesis/nightlySynth.ts`, `toTetherState()` default mapping in `src/hooks/useTetherState.ts`) has no coverage.
- Impact: Any regression in 1RM calculation, synthesis domain inference, or state mapping is invisible until it surfaces at runtime on a user's device.
- Fix: Install Vitest + `@testing-library/react-native`. Start with pure TS logic: `calculate1RM`, `inferDomain`, `DOMAIN_ALTERNATES` mapping, `toTetherState`.

### C-006: SQL injection risk in useJointOps
- Issue: `src/hooks/useJointOps.ts:37` uses raw string interpolation in a Supabase filter:
  ```ts
  .or(`owner_id.eq.${userId},id.in.(select op_id from op_members where profile_id = '${userId}')`)
  ```
- Impact: `userId` is a Supabase UUID (currently safe), but the pattern is fragile. Any future change that allows a non-UUID userId value opens a filter injection path.
- Fix: Replace with a parameterized RPC or use a proper join query that avoids raw string construction.

### C-021: RootStackParamList duplicated — type drift risk
- Issue: `RootStackParamList` is defined independently in two files:
  - `src/native/screens/FitnessOnboardingGrid.tsx` (lines 10–17) — canonical source, imported by `NativeApp.tsx`
  - `src/native/screens/PushDayOnboarding.tsx` (lines 66–69) — local copy, not imported by navigator
- Impact: The two definitions are currently identical, but there is no structural enforcement. Adding a new screen to `FitnessOnboardingGrid`'s version (the navigator's source of truth) will silently leave `PushDayOnboarding`'s copy stale. TypeScript will not catch this because they are separate type declarations, not the same reference.
- Fix: Delete the definition in `PushDayOnboarding.tsx`. Import `type { RootStackParamList }` from `./FitnessOnboardingGrid` instead. Long-term: move the type to `src/native/types.ts`.

### C-016: CORS wildcard on Edge Functions
- Issue: Both `supabase/functions/calculate-1rm/` and `supabase/functions/sync-workout/` use `Access-Control-Allow-Origin: *`.
- Impact: Any origin can call these functions with a valid anon key. Must be restricted to the production domain before go-live.
- Fix: Pass production URL via Deno env var; restrict `Access-Control-Allow-Origin` to that value.

### C-019: `sync-workout` uses service-role key for all DB ops
- Issue: The service role key bypasses RLS entirely.
- Impact: Any bug in the ownership guard is a full data-exposure incident.
- Fix: Scope the service-role key to the upsert only; use the user JWT for reads.

---

## Medium Priority

### C-022: `supabase.ts` TS2591 — `process` not found in native scope
- Issue: `src/lib/supabase.ts` uses `process.env.EXPO_PUBLIC_*`. `@types/node` is in `devDependencies` and `"node"` is in `tsconfig.app.json`'s `types[]`, so the **web build** is clean. However, `src/native/` has no separate tsconfig — Metro/Expo handle its compilation internally. If a native-targeted type-check is ever added (e.g. `tsc --project tsconfig.native.json`), this file will error unless `@types/node` is declared in that config too.
- Files: `src/lib/supabase.ts:9-10`
- Fix: This is currently a dormant concern for the native build path. Document it; add `@types/node` to any future native tsconfig.

### C-023: `synthesis` module has no UI consumer
- Issue: `src/logic/synthesis/` (`nightlySynth.ts`, `DailyPlanSchema.ts`, `index.ts`) is fully implemented pure-TS logic that aggregates Supabase data into a `DailyPlan`. No screen, hook, or component calls `synthesizeDay()`.
- Files: `src/logic/synthesis/nightlySynth.ts`, `src/logic/synthesis/DailyPlanSchema.ts`
- Impact: Dead code in production bundle (Vite tree-shakes it; Metro does not). The synthesis logic may drift from the actual DB schema if migrations change `workouts`/`op_checkpoints` columns and nobody notices.
- Fix: Build a consumer (e.g. a `DailyBriefing` screen) or explicitly park the module with a comment until Phase 02+.

### C-024: `WorkoutSummary.tsx` is a display-only stub
- Issue: `src/native/screens/WorkoutSummary.tsx` renders only the `workoutId` string passed via nav params. No Supabase read, no set/rep summary, no 1RM display, no session stats.
- Files: `src/native/screens/WorkoutSummary.tsx`
- Impact: Users see "SESSION COMPLETE" and a UUID. No actionable data is surfaced.
- Fix: Fetch `workout_sets` by `workoutId`, display set/rep totals and peak 1RM estimate. Fetch HR peak from `hr_readings` if available.

### C-025: `useBunkerTap` hook is orphaned
- Issue: `src/hooks/useBunkerTap.ts` exists (recently moved from root) and exports `useBunkerTap`, but it is imported nowhere in the codebase. `BunkerGate.tsx` does not import it.
- Files: `src/hooks/useBunkerTap.ts`
- Impact: Dead code. If the hook was intended to power the BunkerGate tap sequence, the feature is silently non-functional.
- Fix: Either wire it into `BunkerGate.tsx` (the intended consumer) or delete it.

### C-026: `HubSession.tsx` uses bare `console.error` — logging convention violation
- Issue: `src/native/screens/HubSession.tsx` lines 49 and 52 use `console.error(...)` directly. The project logging convention requires `agentLog.architect()` for operational logs.
- Files: `src/native/screens/HubSession.tsx:49,52`
- Fix: Replace `console.error('[HubSession] ...)` with `agentLog.architect('[HubSession] ...')`. Import `agentLog` from `../../lib/agentLog`.

### C-027: `PushDayOnboarding.tsx` and `RoadSession.tsx` use bare `console.error`/`console.warn`/`console.log`
- Issue: Multiple bare console calls violate the `agentLog` convention:
  - `src/native/screens/PushDayOnboarding.tsx` lines 298, 301, 347, 350, 352, 447, 449, 452, 473
  - `src/native/screens/RoadSession.tsx` line 53
- Fix: Replace with `agentLog.architect()`. Add `import { agentLog } from '../../lib/agentLog'` to each file.

### C-017: Duplicated 1RM formulas across Edge Functions
- Issue: `epley()`, `brzycki()`, `lander()` are defined in both `supabase/functions/calculate-1rm/` and `supabase/functions/sync-workout/`.
- Impact: A fix to one formula must be applied twice or divergence will occur silently.
- Fix: Extract to `supabase/functions/_shared/1rm.ts`, import in both functions.

### C-028: `MatSession.tsx` manifest routing is hardcoded
- Issue: `src/native/screens/MatSession.tsx` ignores the `activityId` route param and always loads `YOGA_FLOW_MANIFEST` (line 44 has a `TODO Phase 2` comment). Any additional Mat domain activities will silently run the same yoga flow.
- Files: `src/native/screens/MatSession.tsx:44-48`
- Fix: Implement manifest selection by `activityId` when the Mat domain has more than one activity.

### C-029: `RoadSession.tsx` manifest routing is hardcoded
- Issue: `src/native/screens/RoadSession.tsx` uses a simple string `.includes('interval')` check on `activityId` to select between two hardcoded manifests. Not routed through `manifest.ts`.
- Files: `src/native/screens/RoadSession.tsx:37-46`
- Fix: Add Road activity manifests to `src/native/screens/manifest.ts`, look up by `activityId`.

### C-018: No React ErrorBoundary
- Issue: No error boundary wraps any part of the web app tree.
- Impact: A Supabase error or Three.js render failure blanks the entire page with no recovery path.
- Fix: Add a minimal `ErrorBoundary` component wrapping `<App />` in `src/main.tsx`.

---

## Low Priority

### C-007: `src/App.css` is vestigial
- Issue: Contains leftover Vite template styles. Safe to delete.
- Files: `src/App.css` (not tracked in `anatomy.md` — likely deleted or renamed; verify)

### C-009: `lucide-react` installed but entirely unused
- Issue: `lucide-react` v1.8.0 is in `dependencies` (not devDependencies), but is not imported anywhere in `src/`.
- Impact: Adds unnecessary bundle weight and a production dependency with no return.
- Fix: Remove from `package.json` dependencies.

### C-013: No React error boundaries — web tree
- Duplicate of C-018 — see above.

### C-014: No loading fallback for Three.js Suspense
- Issue: `<Suspense fallback={null}>` in `WarRoom.tsx` shows blank space while ShimmerCore loads.
- Fix: Provide a minimal fallback (e.g., a pulse animation or static ring) so the initial load is not visually broken.

### C-015: EntryGate silent auth failure
- Issue: If `signInAnonymously()` fails, `setAuthReady(true)` is called without `userId`. The user proceeds with no explanation or retry option.
- Files: `src/components/EntryGate.tsx`
- Fix: Surface an error state with a retry button when anonymous auth fails and the timeout fires.

### C-030: `.agents/` directory was deleted and recreated — impeccable skill state unknown
- Issue: `.agents/` was previously deleted from the repo. It was recreated to install the `impeccable` skill. Any prior git history for `.agents/` contents was broken. The impeccable skill itself (`SKILL.md`, reference files) appears structurally complete, but its session state and any prior observations are gone.
- Files: `.agents/skills/impeccable/`
- Impact: Low — the skill is stateless by design. No functional concern, just a history note.

### C-031: `DESIGN.md` not yet created
- Issue: `PRODUCT.md` was created in the Night Build but `DESIGN.md` was not. If any phase planning references DESIGN.md it will be missing.
- Files: `PRODUCT.md` exists; `DESIGN.md` does not
- Fix: Create `DESIGN.md` covering visual language, color system, type choices, and component aesthetic guidelines when Phase 02+ planning begins.

### C-032: No ROADMAP phases beyond Phase 02 stub
- Issue: `.planning/ROADMAP.md` defines Phase 01 (complete) and Phase 02 (stub — "Not planned"). No Phase 03+ defined.
- Impact: No blocking issue, but sprint planning is opaque. The `STATE.md` confirms "No roadmap — Phase 02 not yet defined."
- Fix: Define Phase 02 scope after migration 06 is applied and HubSession is confirmed working.

### C-033: `agentLog` thin wrapper over `console.log` — no log levels, no filtering
- Issue: `src/lib/agentLog.ts` is a two-line wrapper that calls `console.log` for both `architect` and `valkyrie` channels. No log-level control, no suppression in production, no structured output.
- Files: `src/lib/agentLog.ts`
- Impact: All agent logs appear in production bundles. In the native app, this populates the Metro/device log with debug noise.
- Fix: Add a `__DEV__` guard (React Native global) so logs are suppressed in production builds: `if (__DEV__) console.log(...)`.

---

## Security Considerations

### C-016 (see above): CORS wildcard on Edge Functions
### C-019 (see above): Service-role key scope

### C-034: Anonymous session upgrade — no email verification
- Issue: `upgradeAnonymousUser()` in `src/lib/supabase.ts` calls `supabase.auth.updateUser({ email, password })` directly. Supabase does not enforce email verification by default unless configured in the dashboard.
- Risk: Users can claim any email address without verification, creating spoofed identity upgrades.
- Current mitigation: None in code.
- Fix: Enable "Confirm email" in Supabase Auth settings. Handle the `email_change` confirmation flow in the UI.

---

## Test Coverage Gaps

### All business logic untested
- What's not tested: `calculate1RM` (3-formula consensus), `inferDomain` (name-based heuristic), `DOMAIN_ALTERNATES` mapping, `toTetherState` default injection, `synthesizeDay` aggregation logic, `triggerKillSwitch` fire-and-forget pattern, anonymous→permanent auth upgrade path.
- Files: `src/native/screens/PushDayOnboarding.tsx`, `src/logic/synthesis/nightlySynth.ts`, `src/hooks/useTetherState.ts`, `src/lib/supabase.ts`
- Risk: Regressions in core data paths (1RM, synthesis) are invisible until reported by users on device.
- Priority: High

### Integration layer untested
- What's not tested: Supabase insert/upsert in `HubSession`, `PushDayOnboarding` sync-workout edge function call, `useJointOps` filter query correctness.
- Priority: Medium

---

*Concerns audit: 2026-05-05*
