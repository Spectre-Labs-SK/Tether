# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-04-27T03:12:08.806Z
> Files: 9 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `DEPENDENCIES.md` — Pillar 3 supply chain; all npm deps with versions + env var requirements (~509 tok)
- `TETHER_BUILD_JOURNAL.md` — TETHER BUILD JOURNAL; bug tracker + phase logs (~6835 tok)
- `.env.local` — Supabase env vars (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY); placeholder values; not committed (~50 tok)

## .claude/


## .claude/rules/


## .claude/skills/paperclip/


## .github/workflows/


## .planning/


## .planning/codebase/


## .planning/phases/01-pattern-observer-threejs/


## src/

- `App.tsx` — Root router: gate/chill/sos modes; threads userId from EntryGate to WarRoom; SOSShell breathing timer (~1195 tok)

## src/components/

- `EntryGate.tsx` — Phase B recovery login view + anonymous boot; onEnter(mode, userId) passes userId up to App (~3630 tok)
- `ShimmerCore.tsx` — 3D ShimmerCore sphere; mode + staticLevel props; extracted from App.tsx (~200 tok)
- `WarRoom.tsx` — War Room: calibration bunker + 3D canvas + identity upgrade modal (z-20) + kill switch + Valkyrie gear loadout (mode-driven) + onboarding overlay (z-30, gated by profile.onboarding_pending) (~4303 tok)

## src/components/fitness/

- `FitnessOnboardingGrid.tsx` — Web DOM fitness onboarding: 3-taps-to-active (Domain→Activity→Session Active); Iron gates: trickycardio() then bitchweights(); AMRAP briefing; session up-timer; onComplete() fires completeOnboarding() (~4092 tok)

## src/hooks/


## src/lib/

- `supabase.ts` — Supabase client + Profile/LifeSector/JointOp types + upgradeAnonymousUser() + signInWithEmailPassword() helpers (~817 tok)

## src/native/screens/


## src/registry/valkyrie/


## src/stores/


## supabase/functions/calculate-1rm/


## supabase/functions/sync-workout/


## supabase/migrations/

- `05_identity_upgrade.sql` — Tether | Spectre Labs (~145 tok)
