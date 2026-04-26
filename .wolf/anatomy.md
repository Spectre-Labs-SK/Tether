# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-04-26T08:01:32.465Z
> Files: 7 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `TETHER_BUILD_JOURNAL.md` — TETHER BUILD JOURNAL (~5255 tok)

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
- `WarRoom.tsx` — War Room: calibration bunker + 3D canvas + Phase A identity upgrade modal (updateUser) + Phase C sign-out kill switch (~3646 tok)

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
