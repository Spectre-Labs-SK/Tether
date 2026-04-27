# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-04-27T04:43:36.087Z
> Files: 12 tracked | Anatomy hits: 0 | Misses: 0

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


## .planning/phases/01-pattern-observer-threejs/

- `01-01-SUMMARY.md` — Phase 01 Plan 01: Zustand Bridge and Canonical ShimmerCore Summary (~933 tok)

## src/

- `App.tsx` — Root router: gate/chill/sos modes; threads userId from EntryGate to WarRoom; SOSShell breathing timer (~1195 tok)

## src/components/

- `EntryGate.tsx` — Phase B recovery login view + anonymous boot; onEnter(mode, userId) passes userId up to App (~3630 tok)
- `ShimmerCore.tsx` — Canonical zero-props store-driven sphere; lerps distort/speed/metalness/color via usePatternStore.getState() in useFrame; floatIntensity/floatSpeed as reactive selectors (~516 tok)
- `WarRoom.tsx` — WarRoom (~4035 tok)

## src/components/fitness/

- `FitnessOnboardingGrid.tsx` — Web DOM fitness onboarding: 3-taps-to-active (Domain→Activity→Session Active); Iron gates: trickycardio() then bitchweights(); AMRAP briefing; session up-timer; onComplete() fires completeOnboarding() (~4092 tok)

## src/hooks/


## src/lib/

- `supabase.ts` — Supabase client + Profile/LifeSector/JointOp types + upgradeAnonymousUser() + signInWithEmailPassword() helpers (~817 tok)

## src/native/screens/


## src/registry/valkyrie/


## src/stores/

- `patternStore.ts` — Exports ShimmerTarget, DEFAULTS, usePatternStore (~260 tok)

## supabase/functions/calculate-1rm/


## supabase/functions/sync-workout/


## supabase/migrations/

- `05_identity_upgrade.sql` — Tether | Spectre Labs (~145 tok)
