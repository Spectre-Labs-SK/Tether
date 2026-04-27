# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-04-27T04:58:51.094Z
> Files: 22 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.env.local` — Supabase env vars (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY); placeholder values; not committed (~50 tok)
- `DEPENDENCIES.md` — Pillar 3 supply chain; all npm deps with versions + env var requirements (~509 tok)
- `TETHER_BUILD_JOURNAL.md` — TETHER BUILD JOURNAL; bug tracker + phase logs (~6835 tok)

## .claude/


## .claude/rules/


## .claude/skills/paperclip/


## .github/workflows/


## .planning/


## .planning/codebase/

- `CONVENTIONS.md` — Conventions (~1093 tok)

## .planning/phases/01-pattern-observer-threejs/

- `01-01-SUMMARY.md` — Phase 01 Plan 01: Zustand Bridge and Canonical ShimmerCore Summary (~933 tok)
- `01-02-SUMMARY.md` — Summary (~477 tok)
- `01-03-SUMMARY.md` — Phase 01 Plan 03: Build Pipeline Validation and Zustand Installation Summary (~2171 tok)

## src/

- `App.tsx` — BREATHE_PHASES (~1360 tok)

## src/components/

- `EntryGate.tsx` — Phase B recovery login view + anonymous boot; onEnter(mode, userId) passes userId up to App (~3630 tok)
- `ShimmerCore.tsx` — LERP (~625 tok)
- `WarRoom.tsx` — WarRoom (~4247 tok)

## src/components/fitness/

- `FitnessOnboardingGrid.tsx` — Web DOM fitness onboarding: 3-taps-to-active (Domain→Activity→Session Active); Iron gates: trickycardio() then bitchweights(); AMRAP briefing; session up-timer; onComplete() fires completeOnboarding() (~4092 tok)
- `PushDaySession.tsx` — --------------------------------------------------------------------------- (~4062 tok)

## src/hooks/

- `useJointOps.ts` — Exports JointOpsReturn, useJointOps (~2491 tok)
- `usePatternObserver.ts` — Exports Domain, PatternSignals, usePatternObserver (~837 tok)
- `useTetherState.ts` — Exports UIConfig, BitchWeightFlag, TrickyCardioGate, TetherStateReturn, useTetherState (~3165 tok)

## src/lib/

- `supabase.ts` — Supabase client + Profile/LifeSector/JointOp types + upgradeAnonymousUser() + signInWithEmailPassword() helpers (~817 tok)

## src/native/screens/

- `MatSession.tsx` — Define a simple yoga flow manifest locally. (~1385 tok)
- `PushDayOnboarding.tsx` — SPECTRE LABS — TETHER MOBILE (~7821 tok)
- `RoadSession.tsx` — Assuming RootStackParamList is shared or defined here (~1692 tok)

## src/registry/valkyrie/


## src/stores/

- `patternStore.ts` — Exports ShimmerTarget, DEFAULTS, usePatternStore (~260 tok)

## supabase/functions/calculate-1rm/


## supabase/functions/sync-workout/


## supabase/migrations/

- `05_identity_upgrade.sql` — Tether | Spectre Labs (~145 tok)
