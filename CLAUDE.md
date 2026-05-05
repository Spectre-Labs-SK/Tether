# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# OpenWolf

@.wolf/OPENWOLF.md

This project uses OpenWolf for context management. Read and follow .wolf/OPENWOLF.md every session. Check .wolf/cerebrum.md before generating code. Check .wolf/anatomy.md before reading files.

# Task Observer (One Skill to Rule Them All)

At the start of every task-oriented session — any session where you will use tools to produce deliverables — invoke the `task-observer` skill before proceeding.

Observation log: `.wolf/skill-observations/log.md`
Skill updates staging: `.wolf/skill-updates/`
Cross-cutting principles: `.wolf/skill-observations/cross-cutting-principles.md`

Weekly review: If more than 7 days have passed since the last review and there are open observations, trigger a comprehensive review at session start before proceeding with the task.

---

## Commands

### Web (Vite dev sandbox)

```bash
npm run dev        # Start Vite dev server
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run preview    # Preview production build
```

**Type-check the web build accurately** — use the project-scoped tsconfig to avoid composite build cache false-negatives:

```bash
npx tsc --project tsconfig.app.json --noEmit
```

Do NOT use bare `npx tsc --noEmit` — it may return 0 due to cached `.tsbuildinfo` even when real errors exist.

### Native (Expo / EAS)

```bash
npx expo start                                         # Start Metro bundler
npx expo run:android                                   # Local debug build
eas build --platform android --profile development     # EAS debug APK
eas build --platform android --profile preview         # EAS release APK (do not use release for initial symbol verification)
```

### Patch management

`patches/expo-modules-core+55.0.24.patch` adds `-lc++_shared` to the Android CMake linker flags — required for native symbol linking in debug builds. It runs automatically via `postinstall`:

```bash
npm install        # patch-package applies automatically on every install
npx patch-package  # re-apply manually if needed
```

---

## Architecture

### The dual-build split

This repo runs two completely separate pipelines that share source but never cross over:

| | Web (Vite) | Native (Metro / EAS) |
|---|---|---|
| Entry | `src/App.tsx` | `index.js` → `src/native/NativeApp.tsx` |
| tsconfig | `tsconfig.app.json` (`"include": ["src"]`, excludes `src/native`) | Expo/Metro internal |
| Styling | Tailwind v4 inline utility classes | `StyleSheet.create()` + file-top `COLORS` constants |
| Purpose | **Dev sandbox only** | **The actual product** |

`src/native/` is entirely excluded from `tsconfig.app.json`. The Vite build never touches it; the native build doesn't use Vite. Domain/Activity data used in web components must be replicated locally — never imported from `src/native/`.

### Key source directories

- `src/native/screens/` — All Expo screens (FitnessOnboardingGrid, PushDayOnboarding, RoadSession, MatSession, HubSession)
- `src/native/NativeApp.tsx` — Navigator root; imported by root `index.js`
- `src/components/` — Web-only React components (WarRoom, EntryGate, ShimmerCore)
- `src/hooks/` — Shared hooks (useTetherState, useJointOps, useArmory, usePatternObserver)
- `src/lib/supabase.ts` — Supabase client **and** the central type registry (Profile, JointOp, OpCheckpoint, HRReading, etc.). Add new DB types here.
- `src/logic/synthesis/` — Pure TS, no React. `synthesizeDay(userId, date)` aggregates Supabase data into a `DailyPlan`. No UI consumer yet.
- `src/stores/patternStore.ts` — Zustand store (R3F bridge only — see below)
- `supabase/migrations/` — Postgres migration files

### State management rules

**Default: local `useState`.** Supabase is the source of truth — always write to DB first, then update local state. No optimistic updates (except ops list prepend on `createOp`).

**Exception — Zustand for R3F only.** React hooks cannot be called inside a Three.js `useFrame` loop. When bridging React state into the render loop, use the approved Zustand pattern:
1. Write to `patternStore` from React (hooks/components)
2. Read from the store inside `useFrame` using `store.getState()` (non-reactive direct read)

Do not use Zustand for any state that has no render-loop consumer.

### useTetherState (SPEC-002)

Returns `{ state, isLoading, error, sync, updateTheme, triggerKillSwitch }`. Older API fields (`profile`, `uiConfig`, `triggerCrisisMode`, `completeOnboarding`, `bitchweights`, `trickycardio`) are removed — do not re-introduce them.

- Derive `isUntracked` as `!state && !isLoading`
- `triggerKillSwitch` is fire-and-forget (`() => void`) — clears local state immediately then signs out async. Ethics Charter requirement, do not await it.

### Auth pattern

- Anonymous sessions created at entry; `is_anonymous` is read by casting `session.user as { is_anonymous?: boolean }` (the property exists in the Supabase JWT but is not in the TS SDK types)
- To upgrade anonymous → permanent: `supabase.auth.updateUser({ email, password })` — this preserves the UUID and all linked data. Never use signOut+signIn for this purpose.
- `userId` threading: `EntryGate.onEnter(mode, userId)` → `App` state → `WarRoom` prop → `useTetherState(userId)`

### Environment variables

Both Vite and Expo/Metro resolve the same names:

| Variable | File |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | `.env.local` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` |

Vite injects these via a `define` block in `vite.config.ts`. Metro resolves `EXPO_PUBLIC_*` natively. The Supabase client falls back to placeholder strings so `createClient` doesn't throw when `.env.local` is absent.

### Shimmer modes

- `MILITARY` — `#1e293b` slate, tactical aesthetic
- `ETHER` — `#6d28d9` purple, ethereal aesthetic
- `staticLevel` (0–100) controls `MeshDistortMaterial distort` as `staticLevel / 100`. Initial value 40.
- Gear loadout: MILITARY → `Shadow Visor [ELITE]` + `Carbon Thruster [COMMON]`; ETHER → `Shimmer Crown [PRIME]` + `Ethereal Flight-Span [PRIME]`. Computed by index from `VALKYRIE_MANIFEST.gear.helmets/wings`.

### DailyPlanEvent invariant

`DailyPlanEvent.alternate: DailyPlanAlternate` is **non-nullable**. The synthesizer must always populate it. Never make it optional. Domain alternate map: `iron→mat`, `road→hub`, `mat→hub`, `hub→mat`, `checkpoint→hub/Defer to Next Cycle`.

---

## TypeScript rules

- `verbatimModuleSyntax: true` — type-only imports **must** use `import type { Foo }` or `import { value, type TypeOnly }`. Mixed value+type is fine in that form; pure type imports must use `import type`.
- Do **not** `import React from 'react'` in native files — `react/jsx-runtime` handles JSX and `noUnusedLocals` will flag the import as an error.
- `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `noFallthroughCasesInSwitch` are all enabled.
- All hook return types must be explicitly typed (e.g., `TetherStateReturn`, `JointOpsReturn`, `ArmoryReturn`).

## Naming conventions

| Category | Convention | Example |
|---|---|---|
| Components | PascalCase | `EntryGate`, `ShimmerCore` |
| Hooks | `use` prefix, camelCase | `useTetherState`, `useJointOps` |
| Types / Interfaces | PascalCase | `Profile`, `JointOp`, `TetherState` |
| Constants / Manifests | SCREAMING_SNAKE_CASE | `VALKYRIE_MANIFEST`, `C25K_WEEK_1_DAY_1` |
| Database columns | snake_case | `is_crisis_mode`, `one_rm_kg` |
| Files | PascalCase for components, camelCase for libs/hooks | `EntryGate.tsx`, `supabase.ts` |

## Logging

Use `agentLog.architect()` for operational/debug logs and `agentLog.valkyrie()` for persona/narrative logs. Do not use bare `console.log`.

## END DAY PROTOCOL
Trigger phrase: "End Day"
When Cade says "End Day", execute the following steps in order. Do not ask for confirmation — just run it.
Step 1 — Collect observations
Read .wolf/skill-observations/log.md. Extract all OPEN observations from today's date.
Also read the ## Pending Skill Observations section of CLAUD.md if present (these are Gemini's observations).
Step 2 — Assess skill gaps
Review all OPEN observations across all dates. Group by target skill. Flag any skill that has 3+ open observations as a priority update candidate.
Step 3 — Push to Notion Skill Observatory
Create a new dated session log entry in the Notion Skill Observatory page (https://www.notion.so/3544144fa9cc81b9a10deb8e77bd1042) with:
## End Day — [YYYY-MM-DD]

### Observations logged today: X

[list all observations in standard format]

### Priority skill updates
[any skills with 3+ open observations]

### Pending since last review
[count of total open observations across all dates]
Update the Skill Health table on the Skill Observatory page to reflect current open observation counts.
Step 4 — Summarize for Cade
In chat, give a 3-line summary:

How many observations logged today (Claude + Gemini)
Any skills flagged as priority updates
Total pending observations across all time

Step 5 — Prompt for apply (optional)
If there are priority skill updates, ask: "Want me to apply the skill updates now? Say 'Apply skill updates' to proceed."

## SESSION-END SUMMARY PROTOCOL

At the end of every completed task-oriented session — automatically, without waiting to be asked — surface two things in this order:

**1. Task-Observer Observation Surfacing**
Read `.wolf/skill-observations/log.md`. For each OPEN observation, surface:
- Observation number + title
- One-sentence summary of the issue
- Whether it's already actioned or needs a skill file edit
- Proposed status: ACTIONED or requires further work

**2. Session Summary**
A structured summary of the session covering:
- What was built/changed (bullet list, specific files)
- TypeScript / build status
- Decisions that need Cade's review (numbered list)

Do not wait for "End Day" or any trigger phrase. Surface this at natural session end — when the last task is done and committed.

---

APPLY SKILL UPDATES PROTOCOL
Trigger phrase: "Apply skill updates"
When Cade says "Apply skill updates":

Read all OPEN observations from .wolf/skill-observations/log.md
For each observation with a clear recommendation, propose the specific edit to the skill file
Apply edits directly for small additions (new rules, new examples, clarifications)
For major rewrites, draft the change and confirm with Cade before applying
Mark applied observations as ACTIONED in the log
Update the Skill Health table in Notion
Clear the #