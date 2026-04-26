# Technical Concerns

**Last Mapped:** 2026-04-25

## Critical (Blockers)

### C-001: No .env.local — Supabase will crash on boot
`src/lib/supabase.ts` reads `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` without defaults. No `.env.local` exists. The app calls `createClient(undefined, undefined)` and all Supabase operations will silently fail or throw on first run.
- **Fix**: Create `.env.local` with real Supabase project credentials.

### C-002: React Native screens have no build system
`src/native/` contains full React Native screens importing `react-native`, `react-navigation/native`, `react-native-safe-area-context` — none of which are in `package.json`. `tsconfig.app.json` explicitly excludes `src/native/` from compilation. There is no `app.json`, `babel.config.js`, `metro.config.js`, or Expo SDK installed. These screens exist as source code but cannot be compiled or run.
- **Fix**: Either extract to a separate Expo project, or add Expo SDK + RN dependencies and a separate tsconfig for native.

### C-003: ShimmerCore defined twice — implementations will drift
`App.tsx` contains an inline `ShimmerCore` component (lines 9–23) used by `WarRoom`. `src/components/ShimmerCore.tsx` is a separate standalone component that is **not imported anywhere**. Two divergent copies.
- **Fix**: Remove inline definition from App.tsx; import from `src/components/ShimmerCore.tsx`.

## High Priority

### C-004: SOSShell is a stub
`SOSShell` in `App.tsx` renders only placeholder text ("We've Got You") with a `// TODO` comment. Users who hit the SOS flow land here with no actionable UI — no fitness module, no onboarding, no guidance.

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
| ShimmerCore inline in App.tsx | **STILL TRUE** + ShimmerCore.tsx duplicate exists |
| Supabase Auth flow not configured | **PARTIAL** — anonymous auth works; no email/OAuth |
| VALKYRIE_MANIFEST not wired into UI | **RESOLVED** — wired in EntryGate |
| Kill switch not implemented | **RESOLVED** — handleReset in EntryGate (B-000) |
