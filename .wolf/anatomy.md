# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-05-01T20:52:44.514Z
> Files: 47 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.env.local` — Supabase env vars (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY); placeholder values; not committed (~50 tok)
- `app.json` (~85 tok)
- `babel.config.js` (~31 tok)
- `CLAUDE.md` — OpenWolf (~1863 tok)
- `DEPENDENCIES.md` — Pillar 3 supply chain; all npm deps with versions + env var requirements (~509 tok)
- `GEMINI.md` — PERSONA: Tether Architect (~1234 tok)
- `index.js` (~37 tok)
- `LEARNING_VELOCITY.log` — Timestamped milestone log: ARCH/PATTERN/SCHEMA/MODULE/FIX entries tracking significant capability additions and project learnings (~588 tok)
- `metro.config.js` — Learn more https://docs.expo.io/guides/customizing-metro (~70 tok)
- `package.json` — Node.js package manifest (~366 tok)
- `TETHER_BUILD_JOURNAL.md` — TETHER BUILD JOURNAL; bug tracker + phase logs (~6835 tok)
- `tsconfig.app.json` (~186 tok)
- `vite.config.ts` — Declares env (~191 tok)

## .claude/


## .claude/rules/


## .claude/skills/paperclip/


## .github/workflows/


## .planning/

- `ROADMAP.md` — ROADMAP — Tether (~245 tok)
- `STATE.md` — STATE.md — Tether (~568 tok)

## .planning/codebase/

- `CONVENTIONS.md` — Conventions (~1093 tok)

## .planning/phases/01-pattern-observer-threejs/

- `01-01-SUMMARY.md` — Phase 01 Plan 01: Zustand Bridge and Canonical ShimmerCore Summary (~933 tok)
- `01-02-SUMMARY.md` — Summary (~477 tok)
- `01-03-SUMMARY.md` — Phase 01 Plan 03: Build Pipeline Validation and Zustand Installation Summary (~2171 tok)
- `01-HUMAN-UAT.md` — Tests (~267 tok)
- `01-REVIEW-FIX.md` — Phase 01: Code Review Fix Report (~1540 tok)
- `01-REVIEW.md` — Phase 01: Code Review Report (~3980 tok)
- `01-VERIFICATION.md` — Phase 01: Pattern Observer / Three.js Verification Report (~3475 tok)

## .wolf/skill-observations/

- `cross-cutting-principles.md` — library-wide principles checked when creating/updating any skill (~20 tok)

## .wolf/skill-updates/


## src/

- `App.tsx` — BREATHE_PHASES (~1482 tok)

## src/components/

- `EntryGate.tsx` — EntryGate (~3706 tok)
- `ShimmerCore.tsx` — LERP (~662 tok)
- `WarRoom.tsx` — WarRoom (~4424 tok)

## src/components/fitness/

- `FitnessOnboardingGrid.tsx` — Web DOM fitness onboarding: 3-taps-to-active (Domain→Activity→Session Active); Iron gates: trickycardio() then bitchweights(); AMRAP briefing; session up-timer; onComplete() fires completeOnboarding() (~4092 tok)
- `PushDaySession.tsx` — --------------------------------------------------------------------------- (~4125 tok)

## src/hooks/

- `useArmory.ts` — Exports ArmoryReturn, useArmory (~1308 tok)
- `useJointOps.ts` — Exports JointOpsReturn, useJointOps (~2810 tok)
- `usePatternObserver.ts` — Exports Domain, PatternSignals, usePatternObserver (~837 tok)
- `useTetherState.ts` — SPEC-002: Exports ValkyrieTheme, TetherState, TetherStateReturn (state/isLoading/error/sync/updateTheme/triggerKillSwitch); UIConfig/BitchWeightFlag/TrickyCardioGate retained as type-only exports pending domain hook migration (~2100 tok)

## src/lib/

- `supabase.ts` — Falls back to placeholder values when .env.local is absent so createClient (~865 tok)

## src/logic/synthesis/

- `DailyPlanSchema.ts` — Exports ActivityDomain, EventStatus, DailyPlanAlternate, IronEventData + 6 more (~496 tok)
- `index.ts` (~80 tok)
- `nightlySynth.ts` — Aggregates a user's activity data for a given date from Supabase and (~1778 tok)

## src/native/

- `NativeApp.tsx` — Stack (~326 tok)

## src/native/screens/

- `FitnessOnboardingGrid.tsx` — Assuming a root stack navigator setup (~1763 tok)
- `HubSession.tsx` — COLORS (~1181 tok)
- `manifest.ts` — DOMAINS data (Iron/Road/Mat/Hub), Activity type, C25K_WEEK_1_DAY_1 intervals (~300 tok)
- `MatSession.tsx` — Define a simple yoga flow manifest locally. (~1538 tok)
- `PushDayOnboarding.tsx` — SPECTRE LABS — TETHER MOBILE (~7842 tok)
- `RoadSession.tsx` — COLORS (~1845 tok)

## src/registry/valkyrie/


## src/stores/

- `patternStore.ts` — Exports ShimmerTarget, DEFAULTS, usePatternStore (~260 tok)

## supabase/functions/calculate-1rm/


## supabase/functions/sync-workout/


## supabase/migrations/

- `05_identity_upgrade.sql` — Tether | Spectre Labs (~145 tok)
