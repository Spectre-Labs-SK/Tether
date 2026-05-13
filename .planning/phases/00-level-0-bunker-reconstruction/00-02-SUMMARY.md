---
phase: 00-level-0-bunker-reconstruction
plan: 02
subsystem: data-contracts
tags:
  - phase-0
  - supabase
  - behavior-events
key-files:
  created:
    - .planning/data-model.md
    - supabase/migrations/08_behavior_events_and_questions.sql
    - supabase/migrations/09_generated_plans_and_screenshots.sql
  modified:
    - src/lib/supabase.ts
requirements-completed:
  - P0-BEHAVIOR-EVENTS
  - P0-WIPE-DATA
  - P0-KILL-SWITCH-STUB
  - P0-SCREENSHOT-INGESTION
completed: 2026-05-13
---

# Phase 00 Plan 02: Data Contract Summary

Phase 0 now has a typed, RLS-protected persistence contract for behavior
events, max-three-question sessions, generated plans, plan actions, screenshot
ingestion, and future finance/pantry/pendulum surfaces.

## Tasks

- Created `.planning/data-model.md` with table purpose, trust boundaries,
  required behavior actions, screenshot-only finance scope, wipe data semantics,
  and kill-switch contract.
- Added Supabase migrations for `behavior_events`, `question_sessions`,
  `generated_plans`, `plan_steps`, `plan_actions`, `screenshot_ingestions`,
  `accounts`, `transactions`, `envelopes`, `pantry_items`, `pendulum_events`,
  and `noseyquestions_log`.
- Added central TypeScript row/action types to `src/lib/supabase.ts`.

## Verification

- Data-model `Select-String` contract checks: passed.
- Migration `Select-String` contract checks: passed.
- `npx tsc --project tsconfig.app.json --noEmit`: passed.
- `npm run lint`: passed with one pre-existing vendored warning in
  `.claude/get-shit-done/bin/lib/state.cjs`.

## Deviations from Plan

**[Rule 2 - Missing critical conflict] Migration numbering adjusted** - Found
during: Task 2. `supabase/migrations/07_avatar_loadout.sql` already existed, so
the Phase 0 data-spine migrations were created as `08_behavior_events...` and
`09_generated_plans...` to avoid colliding with existing migration history.

Total deviations: 1 auto-fixed. Impact: positive; migration ordering remains
valid and existing avatar-loadout work is preserved.

## Self-Check: PASSED

UI/hooks can now write typed Phase 0 behavior and plan-action contracts through
Supabase, with RLS policies based on `auth.uid()`.
