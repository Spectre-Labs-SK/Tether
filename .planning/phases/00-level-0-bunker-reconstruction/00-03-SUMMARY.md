---
phase: 00-level-0-bunker-reconstruction
plan: 03
subsystem: native-level-0-bunker
tags:
  - phase-0
  - react-native
  - bunker
key-files:
  created:
    - src/hooks/useLevel0Bunker.ts
    - src/native/screens/Level0BunkerReconstruction.tsx
  modified:
    - src/native/NativeApp.tsx
    - src/native/navigation.types.ts
    - src/native/screens/FitnessOnboardingGrid.tsx
    - src/native/screens/MatSession.tsx
    - src/native/screens/PushDayOnboarding.tsx
    - src/native/screens/RoadSession.tsx
    - src/native/screens/WorkoutSummary.tsx
requirements-completed:
  - P0-BUNKER-VERTICAL-SLICE
  - P0-VISUAL-MODES
  - P0-CHAOS-EVENT
  - P0-INTEL-DROP
completed: 2026-05-13
---

# Phase 00 Plan 03: Native Bunker Slice Summary

The native app now opens on a Level 0 Bunker Reconstruction screen with
Military, Ethereal, and Mixed modes, silent degradation, repair state, a locked
door path, one chaos event, and an earned `// INTEL RECOVERED` moment.

## Tasks

- Created `useLevel0Bunker(userId)` with explicit return types and behavior
  handlers for complete, skip, substitute, shuffle, defer, correction, partner
  response, and chaos response.
- Created `Level0BunkerReconstruction.tsx` as a native screen using
  `StyleSheet.create`, file-top color constants, compact action controls, and
  no marketing landing page.
- Updated native navigation to use `src/native/navigation.types.ts` as the
  central route type and made the Bunker screen the initial native route.
- Confirmed Android package configuration exists in `app.json`.

## Verification

- Android config `Select-String` check: passed.
- `npx tsc --project tsconfig.app.json --noEmit`: passed.
- `npm run lint`: passed with one pre-existing vendored warning in
  `.claude/get-shit-done/bin/lib/state.cjs`.

## Deviations from Plan

None - plan executed exactly as written.

## Manual Verification Still Needed

- Run the Expo native app on Android and capture Military, Ethereal, and Mixed
  mode screenshots for human review.

## Self-Check: PASSED

The first native surface communicates the Bunker loop and records or queues
behavior actions through the Level 0 hook.
