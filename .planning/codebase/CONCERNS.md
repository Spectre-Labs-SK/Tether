# Technical Concerns

**Last Mapped:** 2026-04-27 (refresh after Phase 01 review fixes)

## Critical (Blockers)

### ~~C-001: No .env.local~~ ✅ RESOLVED 2026-04-27
`.env.local` now exists with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `ANTHROPIC_API_KEY`. Supabase client initialises correctly.

### C-002: React Native screens have no build system
`src/native/` contains full React Native screens importing `react-native`, `react-navigation/native`, `react-native-safe-area-context` — none of which are in `package.json`. `tsconfig.app.json` explicitly excludes `src/native/` from compilation. There is no `app.json`, `babel.config.js`, `metro.config.js`, or Expo SDK installed. These screens exist as source code but cannot be compiled or run.
- **Fix**: Either extract to a separate Expo project, or add Expo SDK + RN dependencies and a separate tsconfig for native.

### ~~C-003: ShimmerCore defined twice~~ ✅ PARTIALLY RESOLVED
`App.tsx` no longer has an inline `ShimmerCore`. `WarRoom.tsx` is now a proper component in `src/components/`. `src/components/ShimmerCore.tsx` standalone component still exists but is not imported — the duplicate is resolved architecturally; the dead file can be deleted.

## High Priority

### ~~C-004: SOSShell is a stub~~ ✅ RESOLVED 2026-04-27
`SOSShell` now implements a full 4-phase breathing exercise (INHALE/HOLD/EXHALE/HOLD) with session timer, phase progress display, and start/pause controls. Timer race condition also fixed (phaseIndexRef pattern).

### C-005: Zero automated tests
No test framework installed. Business-critical logic (`bitchweights` 1RM delta, `trickycardio` HR gating, `calculate1RM` formulas) has no test coverage. Any change to these functions is unguarded.

### C-006: SQL injection risk in useJointOps
`useJointOps.ts:37` uses raw string interpolation in a Supabase filter:
```ts
.or(`owner_id.eq.${userId},id.in.(select op_id from op_members where profile_id = '${userId}')`)
```
`userId` comes from Supabase auth (UUID — currently safe) but the pattern is fragile. Should use parameterized RPC or a proper join.

### C-007: src/App.css is vestigial
Confirmed by CLAUDE.md — contains leftover Vite template styles. Safe to delete.

### C-008: Accidental file in src/
`src/# SPECTRE LABS: AGENT PROTOCOLS.md` — a Markdown file with a `#` in its filename lives inside `src/`. Should be moved to root or deleted.

## Medium Priority

### C-009: lucide-react installed but entirely unused
`lucide-react` v1.8.0 is in `dependencies` but is not imported anywhere. Adds bundle weight for zero value.

### C-010: RootStackParamList not shared across native screens
Navigation type `RootStackParamList` is defined inside `PushDayOnboarding.tsx` rather than a shared types file. Other native screens would need to re-define or import it.

### C-011: CLAUDE.md has three outdated "known gaps"
The following gaps listed in CLAUDE.md are **already resolved in code**:
- "staticLevel slider...wire to distort prop" → **already wired**: `distort={staticLevel / 100}` in App.tsx
- "VALKYRIE_MANIFEST not yet wired into any UI" → **wired in EntryGate.tsx** (shows codename + helmet name)
- "Implement kill switch for SOS mode" → **implemented as `handleReset`** in EntryGate (B-000 comment)

### C-012: No React Navigation stack wired for native
`FitnessOnboardingGrid` calls `navigation.navigate()` but there's no navigator setup anywhere in `src/`. The native screens assume a stack navigator that doesn't exist in the current project.

## Low Priority / Nice to Fix

### C-013: No error boundaries
No React error boundaries in the web app. A Supabase error or Three.js render failure will crash the entire app with an unhandled error.

### C-014: No loading fallback for Three.js Suspense
`<Suspense fallback={null}>` in WarRoom shows blank space while ShimmerCore loads.

### C-015: EntryGate doesn't surface auth error state
If `signInAnonymously()` fails, `setAuthReady(true)` is called without `userId`, resulting in a silent untracked session with no user-visible explanation or retry option.

## Known Gaps — Current State vs CLAUDE.md

| CLAUDE.md Gap | Actual Status |
|---|---|
| staticLevel not wired to distort | **RESOLVED** — wired in App.tsx WarRoom |
| lucide-react icons not rendered | **STILL TRUE** — installed, zero usage |
| App.css vestigial | **STILL TRUE** |
| DEPENDENCIES.docx doesn't exist | **STILL TRUE** |
| ShimmerCore inline in App.tsx | **RESOLVED** — WarRoom is now a component; ShimmerCore.tsx is vestigial |
| Supabase Auth flow not configured | **PARTIAL** — anonymous auth works; no email/OAuth |
| VALKYRIE_MANIFEST not wired into UI | **RESOLVED** — wired in EntryGate |
| Kill switch not implemented | **RESOLVED** — handleReset in EntryGate (B-000) |
| No .env.local | **RESOLVED** — .env.local created |
| SOSShell stub | **RESOLVED** — breathing exercise implemented |

## New Concerns — Added 2026-04-27 (from Phase 01 review)

### C-016: CORS wildcard on Edge Functions (HIGH)
Both `calculate-1rm` and `sync-workout` use `Access-Control-Allow-Origin: *`. Must be restricted to production domain before go-live. Log production URL in `.env` and pass via Deno env var.

### C-017: Duplicated 1RM formulas (MEDIUM)
`calculate-1rm/index.ts` and `sync-workout/index.ts` both define `epley()`, `brzycki()`, `lander()`. Extract to `supabase/functions/_shared/1rm.ts`.

### C-018: No React ErrorBoundary (MEDIUM)
No error boundary wraps the app tree. A Supabase error or Three.js render failure will blank the entire page. Add a minimal `ErrorBoundary` component wrapping `<App />`.

### C-019: `sync-workout` uses service-role key for all DB ops (MEDIUM)
The service role key bypasses RLS entirely. Ownership guard compensates partially but any bug in the guard is a full data-exposure incident. Scope the service-role key to the upsert only; use the user JWT for reads.
