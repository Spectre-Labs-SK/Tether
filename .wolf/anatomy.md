# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-04-22T19:36:28.896Z
> Files: 60 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.gitignore` — Git ignore rules (~68 tok)
- `AGENT.md` — SPECTRE LABS: AGENT PROTOCOLS (~1279 tok)
- `CLAUDE.md` — OpenWolf (~1386 tok)
- `CODE_CHEAT_SHEET` — EXECUTION ARCHIVE (~79 tok)
- `eslint.config.js` — ESLint flat configuration (~176 tok)
- `GEMINI.md` — Project: Tether (Spectre Labs) (~117 tok)
- `index.html` — tether (~96 tok)
- `log.sh` (~89 tok)
- `package-lock.json` — npm lock file (~40959 tok)
- `package.json` — Node.js package manifest (~270 tok)
- `README.md` — Project documentation (~607 tok)
- `TETHER_BUILD_JOURNAL.md` — TETHER BUILD JOURNAL (~2732 tok)
- `tsconfig.app.json` (~185 tok)
- `tsconfig.json` — TypeScript configuration (~34 tok)
- `tsconfig.node.json` (~169 tok)
- `vite.config.ts` — Vite build configuration (~72 tok)

## .claude/

- `settings.json` (~441 tok)
- `settings.local.json` (~24 tok)

## .claude/rules/

- `openwolf.md` (~313 tok)

## .claude/skills/paperclip/

- `SKILL.md` — Paperclip â 8M+ Biomedical Papers (~2902 tok)

## .github/workflows/

- `git-sentinel.yml` — CI: Git Sentinel Audit (Free Tier) (~230 tok)

## .planning/

- `config.json` (~122 tok)

## .planning/codebase/

- `ARCHITECTURE.md` — Architecture (~860 tok)
- `CONCERNS.md` — Technical Concerns (~1216 tok)
- `CONVENTIONS.md` — Conventions (~716 tok)
- `INTEGRATIONS.md` — Integrations (~622 tok)
- `STACK.md` — Tech Stack (~400 tok)
- `STRUCTURE.md` — File Structure (~1152 tok)
- `TESTING.md` — Testing (~446 tok)

## .planning/phases/01-pattern-observer-threejs/

- `01-01-PLAN.md` — Trust Boundaries (~3047 tok)
- `01-02-PLAN.md` — stub: ShimmerCore, usePatternObserver (~5248 tok)
- `01-03-PLAN.md` — State Management Exception: Zustand for R3F Bridge Pattern (~2422 tok)
- `01-REQUIREMENTS.md` — Phase 01 — Pattern Observer & Three.js State Mirroring (~1711 tok)
- `01-RESEARCH.md` — Phase 01: PatternObserver + Three.js State Mirroring — Research (~6923 tok)

## src/

- `# SPECTRE LABS: AGENT PROTOCOLS.md` — SPECTRE LABS: AGENT PROTOCOLS (~1100 tok)
- `App.css` — Styles: 8 rules, 6 media queries (~826 tok)
- `App.tsx` — ShimmerCore; PENDING REWRITE in 01-02: inline ShimmerCore deleted, staticLevel removed, appMode threaded to WarRoom+SOSShell, usePatternObserver mounted (~1274 tok)
- `index.css` — Styles: 2 rules (~119 tok)
- `main.tsx` (~66 tok)

## src/components/

- `EntryGate.tsx` — EntryGate — renders chart — uses useState, useEffect (~2048 tok)

## src/hooks/

- `useJointOps.ts` — Exports JointOpsReturn, useJointOps (~2394 tok)
- `usePatternObserver.ts` — [TO BE CREATED in 01-02] Exports PatternSignals type, usePatternObserver hook — maps 9 app signals (appMode, shimmerMode, isCrisisMode, selectedDomain, liftingGated, bitchweightCount) to ShimmerTarget via Zustand setTarget (~400 tok)
- `useTetherState.ts` — Exports UIConfig, BitchWeightFlag, TrickyCardioGate, TetherStateReturn, useTetherState (~3066 tok)

## src/lib/

- `agentLog.ts` — Exports agentLog (~50 tok)
- `supabase.ts` — requires: npm install @supabase/supabase-js (~582 tok)

## src/native/screens/

- `FitnessOnboardingGrid.tsx` — Assuming a root stack navigator setup (~1706 tok)
- `HubSession.tsx` — COLORS — uses useState, useEffect (~989 tok)
- `manifest.ts` — Exports Domain, Activity, IRON_ACTIVITIES, RoadActivityType + 8 more (~1106 tok)
- `MatSession.tsx` — Define a simple yoga flow manifest locally. (~1328 tok)
- `PushDayOnboarding.tsx` — SPECTRE LABS — TETHER MOBILE (~7145 tok)
- `RoadSession.tsx` — Assuming RootStackParamList is shared or defined here (~1574 tok)

## src/registry/valkyrie/

- `houses.ts` — Exports RoninHouseId, RoninTier, ShimmerMode, RoninHouseColors + 3 more (~385 tok)
- `manifest.ts` — Exports ValkyriePart, MovementType, EquipmentType, ValkyrieExercise, VALKYRIE_MANIFEST (~591 tok)

## src/stores/

- `patternStore.ts` — [TO BE CREATED in 01-01] Exports ShimmerTarget (type), DEFAULTS (const), usePatternStore (Zustand store) — Zustand bridge between React state and Three.js render loop; DEFAULTS = gate/idle state (#1e293b, distort 0.15, metalness 0.9) (~300 tok)

## supabase/functions/calculate-1rm/

- `index.ts` — SPECTRE LABS — TETHER (~777 tok)

## supabase/functions/sync-workout/

- `index.ts` — SPECTRE LABS — TETHER (~2196 tok)

## supabase/migrations/

- `01_initial_schema.sql` — Tether | Spectre Labs (~509 tok)
- `02_fitness_schema.sql` — Tether | Spectre Labs (~1330 tok)
- `03_joint_ops_schema.sql` — Tether | Spectre Labs (~1332 tok)
- `04_hr_clash_schema.sql` — Tether | Spectre Labs (~714 tok)
