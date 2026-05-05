# Codebase Structure

**Analysis Date:** 2026-05-05

## Directory Layout

```
tether-safe/
├── index.js                        # Native entry point — registerRootComponent(NativeApp)
├── package.json                    # Dependencies; "main": "index.js"; "type": "module"
├── metro.config.cjs                # CJS required (package.json is ESM); expo/metro-config
├── babel.config.js                 # babel-preset-expo for Metro transpilation
├── tsconfig.app.json               # Web build tsconfig; includes src/, excludes src/native/
├── vite.config.ts                  # Vite dev server; define block injects EXPO_PUBLIC_* vars
├── app.json                        # Expo config (name, slug, version, android.package, EAS projectId)
├── eas.json                        # EAS Build profiles (development, preview)
├── .env.local                      # EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY (not committed)
│
├── src/
│   ├── App.tsx                     # Web sandbox root; appMode state machine (gate/chill/sos); userId threading
│   ├── index.css                   # Tailwind v4 global styles (web only)
│   │
│   ├── components/                 # Web-only React components
│   │   ├── BunkerGate.tsx          # Auth entry gate; anonymous sign-in; 3000ms hard timeout
│   │   ├── EntryGate.tsx           # Identity upgrade UI (anonymous → registered)
│   │   ├── ShimmerCore.tsx         # Three.js R3F sphere; reads patternStore in useFrame
│   │   ├── WarRoom.tsx             # Main web dashboard; calls useTetherState(userId)
│   │   └── fitness/
│   │       ├── FitnessOnboardingGrid.tsx  # Web port of domain/activity onboarding (local domain data)
│   │       └── PushDaySession.tsx         # Web push day session component
│   │
│   ├── hooks/                      # Shared hooks (web consumers only — not imported by native)
│   │   ├── useArmory.ts            # bitchweights() + trickycardio() analytics gates
│   │   ├── useJointOps.ts          # CRUD for joint_ops, members, checkpoints, HR sync
│   │   ├── usePatternObserver.ts   # Maps app signals → ShimmerTarget → patternStore.setTarget
│   │   ├── usePatternStore.ts      # (alias — store lives in src/stores/patternStore.ts)
│   │   ├── useBunkerTap.ts         # Tap interaction hook for BunkerGate
│   │   └── useTetherState.ts       # SPEC-002: profile load/create, updateTheme, triggerKillSwitch
│   │
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client + ALL DB type definitions (central type registry)
│   │   └── agentLog.ts             # agentLog.architect() / agentLog.valkyrie() logging facade
│   │
│   ├── logic/
│   │   └── synthesis/
│   │       ├── DailyPlanSchema.ts  # Types: DailyPlan, DailyPlanEvent, DailyPlanAlternate, ActivityDomain
│   │       ├── nightlySynth.ts     # synthesizeDay(userId, date) → DailyPlan (pure TS, no React)
│   │       └── index.ts            # Barrel export
│   │
│   ├── native/
│   │   ├── NativeApp.tsx           # Navigator root; createNativeStackNavigator<RootStackParamList>
│   │   └── screens/
│   │       ├── manifest.ts         # Domain/Activity registry; C25K_WEEK_1_DAY_1 intervals; DOMAINS array
│   │       ├── FitnessOnboardingGrid.tsx  # Initial screen; owns RootStackParamList type; domain→activity flow
│   │       ├── PushDayOnboarding.tsx      # Iron/Push session; receives { shimmerMode } nav param
│   │       ├── RoadSession.tsx            # Cardio session; receives { activityId } nav param
│   │       ├── MatSession.tsx             # Flexibility/bodyweight session; receives { activityId }
│   │       ├── HubSession.tsx             # Desk/active recovery; writes to hub_sessions table
│   │       └── WorkoutSummary.tsx         # Post-session summary; { workoutId } param; popToTop() exit
│   │
│   ├── registry/
│   │   └── valkyrie/
│   │       ├── houses.ts           # ShimmerMode type ('MILITARY' | 'ETHER'); valkyrie house definitions
│   │       └── manifest.ts         # VALKYRIE_MANIFEST: gear arrays (helmets/wings with name/rarity)
│   │
│   └── stores/
│       └── patternStore.ts         # Zustand store: ShimmerTarget shape; setTarget(); R3F bridge only
│
├── supabase/
│   ├── migrations/
│   │   ├── 05_identity_upgrade.sql         # Auth upgrade helpers
│   │   └── 06_tether_state_and_hub_sessions.sql  # profiles columns (is_nightmare_active, theme_state) + hub_sessions table
│   └── functions/
│       ├── calculate-1rm/          # Edge function stub
│       └── sync-workout/           # Edge function stub
│
├── patches/
│   └── expo-modules-core+55.0.24.patch  # CMake linker patch (likely obsolete — see cerebrum.md)
│
├── .planning/
│   ├── ROADMAP.md
│   ├── STATE.md
│   ├── codebase/                   # Codebase map documents (this directory)
│   └── phases/                     # Per-phase plan + review documents
│
├── .wolf/                          # OpenWolf context management
│   ├── OPENWOLF.md                 # Operating protocol
│   ├── anatomy.md                  # File registry with token estimates
│   ├── cerebrum.md                 # Learnings, preferences, do-not-repeat, decision log
│   ├── memory.md                   # Session action log
│   ├── buglog.json                 # Bug history
│   ├── token-ledger.json
│   ├── skill-observations/
│   └── skill-updates/
│
└── .claude/
    ├── rules/
    │   └── openwolf.md             # OpenWolf rule injection for Claude
    └── skills/
        └── task-observer/
            └── SKILL.md
```

## Directory Purposes

**`src/native/`:**
- Purpose: The actual product — all Expo/React Native code
- Contains: Navigator root (`NativeApp.tsx`), all session screens, domain/activity manifest
- Key files: `NativeApp.tsx`, `screens/FitnessOnboardingGrid.tsx`, `screens/manifest.ts`
- Excluded from: `tsconfig.app.json` — never imported by web components

**`src/components/`:**
- Purpose: Web sandbox UI components only
- Contains: Auth gate, Three.js canvas shell, web fitness components
- Key files: `BunkerGate.tsx`, `WarRoom.tsx`, `ShimmerCore.tsx`

**`src/hooks/`:**
- Purpose: Supabase data hooks, analytics gates, R3F bridge observer
- Contains: Custom hooks, all with explicit return types
- Key files: `useTetherState.ts`, `useJointOps.ts`, `useArmory.ts`, `usePatternObserver.ts`

**`src/lib/`:**
- Purpose: Client singletons and logging facade
- Contains: Supabase client + all DB type definitions, `agentLog` facade
- Key files: `supabase.ts` (central type registry — add new DB types here)

**`src/logic/synthesis/`:**
- Purpose: Pure TS business logic — no React, no side effects
- Contains: `synthesizeDay` aggregator, `DailyPlan*` type definitions
- Key files: `DailyPlanSchema.ts`, `nightlySynth.ts`

**`src/registry/valkyrie/`:**
- Purpose: Static manifests; no runtime logic
- Contains: `VALKYRIE_MANIFEST`, `ShimmerMode` type
- Key files: `manifest.ts`, `houses.ts`

**`src/stores/`:**
- Purpose: Zustand stores (R3F bridge only)
- Contains: `patternStore` — `ShimmerTarget` shape + `setTarget`
- Key files: `patternStore.ts`

**`supabase/migrations/`:**
- Purpose: Postgres schema evolution
- Contains: Numbered SQL migration files
- Committed: Yes. Run via `supabase db push` or Supabase dashboard.

**`supabase/functions/`:**
- Purpose: Edge function stubs (not yet implemented)
- Contains: `calculate-1rm/`, `sync-workout/`

## Key File Locations

**Entry Points:**
- `index.js` — Native Expo entry (only: `registerRootComponent(NativeApp)`)
- `src/App.tsx` — Web Vite entry; `appMode` state machine

**Configuration:**
- `tsconfig.app.json` — Web build; excludes `src/native/`
- `metro.config.cjs` — Metro bundler config (must be `.cjs`, not `.js`)
- `vite.config.ts` — Vite config; `define` block for `EXPO_PUBLIC_*` vars
- `app.json` — Expo app config; required fields: `name`, `slug`, `version`, `android.package`, `extra.eas.projectId`
- `eas.json` — EAS Build profiles

**Type Registry:**
- `src/lib/supabase.ts` — All DB types live here (`Profile`, `JointOp`, `OpCheckpoint`, `HRReading`, `OpHRSync`, `LifeSectors`)
- `src/logic/synthesis/DailyPlanSchema.ts` — Synthesis layer types
- `src/native/screens/FitnessOnboardingGrid.tsx` — `RootStackParamList` (navigation types)
- `src/native/screens/manifest.ts` — `Domain`, `Activity`, `Interval` types + data arrays

**Core Logic:**
- `src/hooks/useTetherState.ts` — Profile state management (SPEC-002)
- `src/hooks/usePatternObserver.ts` — R3F signal dispatcher
- `src/logic/synthesis/nightlySynth.ts` — `synthesizeDay(userId, date)`

## Naming Conventions

**Files:**
- PascalCase for components: `BunkerGate.tsx`, `WorkoutSummary.tsx`, `NativeApp.tsx`
- camelCase for libs/hooks/stores: `supabase.ts`, `useTetherState.ts`, `patternStore.ts`
- SCREAMING_SNAKE_CASE for constants/manifests: `VALKYRIE_MANIFEST`, `C25K_WEEK_1_DAY_1`

**Directories:**
- lowercase + camelCase: `src/hooks/`, `src/lib/`, `src/logic/synthesis/`
- Descriptive: `src/native/screens/` (not `src/native/views/` or `src/native/pages/`)

## Where to Add New Code

**New native screen:**
- Implementation: `src/native/screens/NewScreen.tsx`
- Register in navigator: `src/native/NativeApp.tsx` — add `Stack.Screen` entry
- Add route param type: `src/native/screens/FitnessOnboardingGrid.tsx` — extend `RootStackParamList`
- Use `StyleSheet.create()` + file-top `COLORS` constant block (no Tailwind in native)
- Do NOT import React — `react/jsx-runtime` handles JSX automatically

**New Supabase hook:**
- Implementation: `src/hooks/useNewHook.ts`
- Pattern: explicit return type (`NewHookReturn`), `useState`, DB-first writes, `agentLog.architect()` for all paths
- Export return type for callers to use in prop types

**New DB type:**
- Add to: `src/lib/supabase.ts` (central type registry)
- Add migration: `supabase/migrations/07_description.sql` (increment prefix number)

**New synthesis type:**
- Add to: `src/logic/synthesis/DailyPlanSchema.ts`
- Export from: `src/logic/synthesis/index.ts`

**New web component:**
- Implementation: `src/components/NewComponent.tsx`
- Use Tailwind v4 utility classes (no `StyleSheet`)
- Do NOT import from `src/native/` — replicate any needed data locally

**New static manifest / constant:**
- Implementation: `src/registry/valkyrie/newManifest.ts` (if Valkyrie-related) or `src/lib/newManifest.ts`

## Special Directories

**`src/native/`:**
- Purpose: Expo product code
- Generated: No (hand-authored)
- Committed: Yes
- Note: Excluded from `tsconfig.app.json`. Vite build never processes it.

**`android/` and `ios/`:**
- Purpose: Generated native project folders
- Generated: Yes — by `expo prebuild` during EAS Build
- Committed: No (gitignored, CNG pattern)

**`.wolf/`:**
- Purpose: OpenWolf context management (anatomy, cerebrum, memory, buglog)
- Generated: Partially (maintained by AI agent during sessions)
- Committed: Yes

**`.planning/`:**
- Purpose: Roadmap, state tracking, codebase maps, phase plans
- Generated: By AI mapping/planning commands
- Committed: Yes

**`supabase/migrations/`:**
- Purpose: Postgres schema history
- Generated: No (hand-authored)
- Committed: Yes

**`node_modules/`:**
- Generated: Yes (`npm install`)
- Committed: No

---

*Structure analysis: 2026-05-05*
