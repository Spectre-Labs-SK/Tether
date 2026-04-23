# File Structure

## Directory Tree

```
Tether/
├── src/
│   ├── App.tsx                    — Root app; mode routing + WarRoom/SOSShell + ShimmerCore inline
│   ├── main.tsx                   — React DOM root mount
│   ├── index.css                  — Tailwind v4 import + .noise-overlay CSS var
│   ├── App.css                    — Vestigial Vite template styles (unused)
│   ├── # SPECTRE LABS: AGENT PROTOCOLS.md  — Accidental file in src/ (hash in filename)
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── EntryGate.tsx          — Auth gate; 50/50 Chill/SOS split; anonymous sign-in + kill switch
│   │   └── ShimmerCore.tsx        — Standalone Three.js sphere component (NOT used — App.tsx has inline duplicate)
│   ├── hooks/
│   │   ├── useTetherState.ts      — Profile state machine; crisis mode; bitchweights; trickycardio
│   │   └── useJointOps.ts         — Joint Op CRUD; member management; HR sync
│   ├── lib/
│   │   ├── supabase.ts            — Supabase client + all TypeScript type definitions
│   │   └── agentLog.ts            — Branded console logger (architect / valkyrie personas)
│   ├── native/screens/            — React Native screens (EXCLUDED from Vite build / tsconfig)
│   │   ├── manifest.ts            — Domain/activity registry (Iron/Road/Mat/Hub + C25K intervals)
│   │   ├── FitnessOnboardingGrid.tsx — 2-step domain→activity selector (3-taps protocol)
│   │   ├── PushDayOnboarding.tsx  — Iron domain: Push Day workout logger + 1RM calc
│   │   ├── RoadSession.tsx        — Road domain: cardio interval timer
│   │   ├── MatSession.tsx         — Mat domain: yoga/pose follow-along timer
│   │   └── HubSession.tsx         — Hub domain: desk up-time + postural reset tracker
│   └── registry/valkyrie/
│       ├── manifest.ts            — VALKYRIE_MANIFEST (gear: helmets, wings)
│       └── houses.ts              — RONIN_HOUSES (The Outpost / Sector 7 / Iron Gate)
├── supabase/
│   ├── migrations/
│   │   ├── 01_initial_schema.sql  — profiles + life_sectors tables
│   │   ├── 02_fitness_schema.sql  — workouts, exercises, workout_sets, one_rm_history
│   │   ├── 03_joint_ops_schema.sql — joint_ops, op_members, op_checkpoints
│   │   └── 04_hr_clash_schema.sql — hr_readings, op_hr_sync; clash_state on joint_ops
│   └── functions/
│       ├── calculate-1rm/index.ts — Edge function: server-side 1RM calculation
│       └── sync-workout/index.ts  — Edge function: workout session persistence
├── .planning/codebase/            — GSD codebase map documents
├── .wolf/                         — OpenWolf context management
├── .claude/                       — Claude Code settings + rules + skills
├── package.json                   — npm manifest
├── vite.config.ts                 — Vite + React + Tailwind plugins
├── tsconfig.app.json              — Web build TS config (excludes src/native/)
├── tsconfig.json                  — Project references
├── tsconfig.node.json             — Node/Vite tools TS config
└── eslint.config.js               — ESLint flat config
```

## Entry Points

- **Web**: `index.html` → `src/main.tsx` → `src/App.tsx`
- **Native**: No entry point wired. `FitnessOnboardingGrid.tsx` is the intended navigator root.
- **Edge Functions**: `supabase/functions/*/index.ts` (Deno runtime, deployed via Supabase CLI)

## Key Files

| File | Tokens | Role |
|---|---|---|
| src/App.tsx | ~1274 | Root; owns appMode; contains ShimmerCore inline duplicate |
| src/components/EntryGate.tsx | ~2048 | Auth + entry UX; owns userId state |
| src/hooks/useTetherState.ts | ~3066 | Core state hook; profile, crisis mode, fitness gates |
| src/hooks/useJointOps.ts | ~2394 | Collaborative layer hook |
| src/lib/supabase.ts | ~582 | Supabase client + 8 exported types |
| src/native/screens/PushDayOnboarding.tsx | ~7145 | Most complex screen; 3-formula 1RM engine |
| src/registry/valkyrie/manifest.ts | ~591 | Gear/equipment data used in EntryGate display |

## Screens

| Screen | Domain | Platform | Status |
|---|---|---|---|
| EntryGate | Auth | Web | Complete — auth, 50/50 UI, kill switch |
| WarRoom | Home | Web | Functional — ShimmerCore 3D, mode toggle |
| SOSShell | Crisis | Web | **Stub** — placeholder text only, TODO comment |
| FitnessOnboardingGrid | Navigation | Native | Complete — domain + activity selection |
| PushDayOnboarding | Iron | Native | Complete — full workout logger |
| RoadSession | Road | Native | Implemented — interval timer |
| MatSession | Mat | Native | Implemented — yoga pose timer |
| HubSession | Hub | Native | Implemented — desk tracker |
