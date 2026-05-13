---
phase: 00-level-0-bunker-reconstruction
plan: 04
subsystem: joint-ghost-fitness
tags:
  - phase-0
  - joint-ops
  - ghost-ops
key-files:
  created:
    - src/hooks/useJointFitnessPlan.ts
  modified:
    - src/native/screens/Level0BunkerReconstruction.tsx
    - src/lib/supabase.ts
requirements-completed:
  - P0-JOINT-OPS-FITNESS
  - P0-GHOST-OPS
  - P0-THREE-QUESTION-MAX
  - P0-ADAPTIVE-ACTIONS
completed: 2026-05-13
---

# Phase 00 Plan 04: Joint/Ghost Fitness Summary

Level 0 now includes a Joint Ops/Ghost Ops fitness mission panel that asks at
most three questions, drafts one adaptive local action, and exposes complete,
skip, substitute, shuffle, defer, correction, and partner-response behavior.

## Tasks

- Created `useJointFitnessPlan(userId)` with explicit return types, a
  three-question cap, deterministic local drafting shaped like future AI output,
  and DB-first plan/action writes when `userId` is available.
- Integrated the fitness mission panel into `Level0BunkerReconstruction.tsx`.
- Verified required behavior actions are present in both the hook and screen.

## Verification

- Behavior coverage `Select-String` check: passed.
- `npx tsc --project tsconfig.app.json --noEmit`: passed.
- `npm run lint`: passed with one pre-existing vendored warning in
  `.claude/get-shit-done/bin/lib/state.cjs`.

## Deviations from Plan

None - plan executed exactly as written.

## Manual Verification Still Needed

- Run the Expo native app on Android and test the Joint/Ghost panel with real
  taps and screenshots.

## Self-Check: PASSED

The slice supports a practical two-person fitness loop without reintroducing the
legacy hardcoded workout foundation.
