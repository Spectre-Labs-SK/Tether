# Codebase Structure

**Analysis Date:** 2026-04-22

## Directory Layout

```
Tether/
├── src/                        # All TypeScript/React source
│   ├── App.tsx                 # Web app root: AppMode router + WarRoom + SOSShell
│   ├── main.tsx                # Browser entry point: ReactDOM.createRoot
│   ├── index.css               # Tailwind v4 import + body reset + .noise-overlay
│   ├── App.css                 # Vestigial Vite template styles (unused)
│   ├── assets/                 # Static assets (hero.png, react.svg, vite.svg)
│   ├── components/             # Reusable web UI components
│   │   ├── EntryGate.tsx       # Auth gate: anonymous sign-in + chill/SOS split
│   │   └── ShimmerCore.tsx     # Three.js MeshDistortMaterial sphere component
│   ├── hooks/                  # Custom React hooks (state + Supabase logic)
│   │   ├── useTetherState.ts   # Profile state machine, crisis mode, bitchweights, trickycardio
│   │   └── useJointOps.ts      # Collaborative ops CRUD, clash state, HR sync
│   ├── lib/                    # Singleton clients and utilities
│   │   ├── supabase.ts         # Supabase client + all DB row types
│   │   └── agentLog.ts         # Console log wrapper (architect / valkyrie channels)
│   ├── native/                 # React Native / Expo screens (not yet wired to a navigator)
│   │   └── screens/
│   │       ├── FitnessOnboardingGrid.tsx  # Domain → Activity 2-step selector
│   │       ├── PushDayOnboarding.tsx      # Iron domain: Push Day workout logger + 1RM calc
│   │       ├── RoadSession.tsx            # Road domain: interval/steady cardio timer
│   │       ├── MatSession.tsx             # Mat domain: yoga pose countdown with haptics
│   │       ├── HubSession.tsx             # Hub domain: desk up-time + postural reset tracker
│   │       └── manifest.ts               # DOMAINS registry + activity arrays + C25K intervals
│   └── registry/               # Static data manifests (no runtime logic)
│       └── valkyrie/
│           ├── manifest.ts     # VALKYRIE_MANIFEST: gear catalogue + Push Day exercises
│           └── houses.ts       # RONIN_HOUSES registry + ShimmerMode type
├── supabase/                   # Backend: migrations + edge functions
│   ├── migrations/
│   │   ├── 01_initial_schema.sql   # profiles, life_sectors, RLS, updated_at trigger
│   │   ├── 02_fitness_schema.sql   # fitness/workout tables
│   │   ├── 03_joint_ops_schema.sql # joint_ops, op_members, op_checkpoints, RLS
│   │   └── 04_hr_clash_schema.sql  # hr_readings, op_hr_sync, clash_state column
│   └── functions/
│       ├── calculate-1rm/index.ts  # Deno: POST weightKg/reps → Epley/Brzycki/Lander/consensus
│       └── sync-workout/index.ts   # Deno: POST workout data → DB persistence
├── public/                     # Vite public assets (served at root)
├── .planning/                  # GSD planning documents
│   └── codebase/               # Codebase analysis documents (this directory)
├── .wolf/                      # OpenWolf context management
│   ├── anatomy.md              # File registry with token estimates
│   ├── cerebrum.md             # Learnings, preferences, do-not-repeat log
│   ├── memory.md               # Session action log
│   ├── buglog.json             # Bug history
│   └── hooks/                  # OpenWolf git hooks
├── .claude/                    # Claude Code configuration
│   ├── rules/openwolf.md       # Claude-specific OpenWolf rule enforcement
│   └── skills/paperclip/       # Paperclip skill (biomedical papers — likely leftover)
├── .github/workflows/
│   └── git-sentinel.yml        # CI: audit workflow
├── index.html                  # Vite HTML entry shell
├── package.json                # Node dependencies + npm scripts
├── vite.config.ts              # Vite: react plugin + tailwindcss plugin
├── tsconfig.json               # TypeScript project references root
├── tsconfig.app.json           # App TypeScript config (targets src/)
├── tsconfig.node.json          # Node TypeScript config (targets vite.config.ts)
└── eslint.config.js            # ESLint flat config (typescript-eslint + react-hooks)
```

## Directory Purposes

**`src/`:**
- Purpose: All application source code
- Contains: Web app entry, components, hooks, lib utilities, native screen stubs, registry data
- Key files: `src/main.tsx` (web entry), `src/App.tsx` (root component)

**`src/components/`:**
- Purpose: Presentational React components for the web build
- Contains: `EntryGate.tsx` (the only rendered screen beyond App.tsx), `ShimmerCore.tsx` (extracted 3D component)
- Key files: `src/components/EntryGate.tsx`

**`src/hooks/`:**
- Purpose: Custom hooks that own all async state and Supabase interaction
- Contains: `useTetherState.ts`, `useJointOps.ts`
- Key files: `src/hooks/useTetherState.ts` — contains the core profile state machine

**`src/lib/`:**
- Purpose: Shared infrastructure — one Supabase client instance, shared types, logging
- Contains: `supabase.ts`, `agentLog.ts`
- Key files: `src/lib/supabase.ts` — the single source of all DB row type definitions

**`src/native/screens/`:**
- Purpose: React Native screen components for the future Expo mobile build
- Contains: All 5 session screens + `manifest.ts`
- Key files: `src/native/screens/FitnessOnboardingGrid.tsx` (defines `RootStackParamList`), `src/native/screens/manifest.ts` (DOMAINS registry)
- Note: These files import from `../../core/manifest` which does not exist; the manifest file is currently at `src/native/screens/manifest.ts`

**`src/registry/valkyrie/`:**
- Purpose: Static data for the Valkyrie/Shimmer aesthetic and training system
- Contains: `manifest.ts` (gear + exercises as `as const`), `houses.ts` (Ronin Houses + ShimmerMode)
- Key files: `src/registry/valkyrie/houses.ts` — defines the `ShimmerMode` type used throughout

**`supabase/migrations/`:**
- Purpose: Versioned PostgreSQL schema definitions applied sequentially
- Contains: 4 migrations covering profiles → fitness → joint ops → HR/clash
- Key files: `supabase/migrations/01_initial_schema.sql` (defines `update_updated_at()` trigger reused by later migrations)

**`supabase/functions/`:**
- Purpose: Deno-runtime Supabase Edge Functions for server-side compute
- Contains: `calculate-1rm/` (1RM formula endpoint), `sync-workout/` (workout data sync)

**`.wolf/`:**
- Purpose: OpenWolf context management system — persists learnings, file registry, and bug history across sessions
- Generated: Partially (anatomy.md is auto-maintained)
- Committed: Yes

**`.planning/codebase/`:**
- Purpose: GSD codebase map documents consumed by planning and execution commands
- Generated: Yes (by `/gsd-map-codebase`)
- Committed: Yes

## Key File Locations

**Entry Points:**
- `src/main.tsx`: Browser entry — mounts `<App />`
- `index.html`: Vite HTML shell — references `src/main.tsx`

**Configuration:**
- `vite.config.ts`: Vite build config (react + tailwindcss plugins)
- `tsconfig.app.json`: TypeScript config for `src/`
- `eslint.config.js`: ESLint flat config
- `src/index.css`: Tailwind v4 import + global styles (`.noise-overlay`)

**Core Logic:**
- `src/App.tsx`: Top-level state machine — `AppMode` routing
- `src/components/EntryGate.tsx`: Auth + entry routing
- `src/hooks/useTetherState.ts`: Profile state, crisis mode, analytics hooks
- `src/hooks/useJointOps.ts`: Collaborative ops state

**All DB Types:**
- `src/lib/supabase.ts`: Single source of truth for `Profile`, `LifeSectors`, `JointOp`, `OpMember`, `OpCheckpoint`, `HRReading`, `OpHRSync`

**Domain Data:**
- `src/native/screens/manifest.ts`: `DOMAINS` array, activity arrays, C25K interval manifest
- `src/registry/valkyrie/manifest.ts`: `VALKYRIE_MANIFEST` (gear + training)
- `src/registry/valkyrie/houses.ts`: `RONIN_HOUSES`, `ShimmerMode` type

**Supabase Backend:**
- `supabase/migrations/`: Apply in numeric order (`01` → `04`)
- `supabase/functions/calculate-1rm/index.ts`: 1RM edge function
- `supabase/functions/sync-workout/index.ts`: Workout sync edge function

## Naming Conventions

**Files:**
- PascalCase for React components: `EntryGate.tsx`, `ShimmerCore.tsx`, `FitnessOnboardingGrid.tsx`
- camelCase for hooks: `useTetherState.ts`, `useJointOps.ts`
- camelCase for utilities: `agentLog.ts`, `supabase.ts`
- camelCase for data files: `manifest.ts`, `houses.ts`
- Snake-case with numbers for migrations: `01_initial_schema.sql`

**Directories:**
- kebab-case for feature directories: `calculate-1rm`, `sync-workout`
- lowercase for grouping directories: `components`, `hooks`, `lib`, `screens`, `valkyrie`
- PascalCase only appears for screen files, not directories

**Types:**
- PascalCase interfaces and types: `Profile`, `JointOp`, `UIConfig`, `ShimmerMode`
- SCREAMING_SNAKE_CASE for static data constants: `VALKYRIE_MANIFEST`, `DOMAINS`, `RONIN_HOUSES`
- SCREAMING_SNAKE_CASE for enum-like string literal types: `'MILITARY'`, `'ETHER'`

**Exports:**
- Default exports for all React components
- Named exports for hooks, types, and utility functions
- `as const` for static manifest objects

## Where to Add New Code

**New Web Screen/View:**
- Implementation: `src/components/[ComponentName].tsx`
- Wire into: `src/App.tsx` — add new `AppMode` value and conditional render

**New Custom Hook:**
- Implementation: `src/hooks/use[FeatureName].ts`
- Pattern: Follow `useTetherState.ts` — accept `userId: string | null`, return typed object, guard all Supabase calls with `if (!userId) return`

**New DB Row Type:**
- Add to: `src/lib/supabase.ts` alongside existing types
- Corresponding migration: `supabase/migrations/0N_[feature]_schema.sql` (increment N)

**New Native Screen:**
- Implementation: `src/native/screens/[ScreenName].tsx`
- Register in: `src/native/screens/FitnessOnboardingGrid.tsx` → `RootStackParamList`
- Pattern: Follow `HubSession.tsx` or `MatSession.tsx` for minimal screens

**New Activity Domain:**
- Add domain to: `src/native/screens/manifest.ts` → `DOMAINS` array + activities array
- Add route case to: `src/native/screens/FitnessOnboardingGrid.tsx` → `handleActivitySelect` switch

**New Edge Function:**
- Create: `supabase/functions/[function-name]/index.ts`
- Pattern: Follow `calculate-1rm/index.ts` — use `serve()`, define `CORS_HEADERS`, validate body, return `jsonResponse()`

**New Registry Data:**
- Add to: `src/registry/valkyrie/manifest.ts` or `src/registry/valkyrie/houses.ts`
- Use `as const` for static data, `satisfies TypeName[]` for typed arrays

**Shared Utilities:**
- Add to: `src/lib/` if it is infrastructure (client, logger)
- Keep pure data in `src/registry/`, logic in `src/hooks/`, UI in `src/components/`

## Special Directories

**`.wolf/`:**
- Purpose: OpenWolf session memory — `anatomy.md` (file index), `cerebrum.md` (learnings), `memory.md` (action log), `buglog.json` (bug history)
- Generated: `anatomy.md` is auto-maintained by OpenWolf; others are manually appended
- Committed: Yes — intentional cross-session persistence

**`.planning/`:**
- Purpose: GSD planning artifacts (codebase maps, phase plans)
- Generated: Yes (by GSD commands)
- Committed: Yes

**`node_modules/`:**
- Generated: Yes
- Committed: No (in `.gitignore`)

---

*Structure analysis: 2026-04-22*
