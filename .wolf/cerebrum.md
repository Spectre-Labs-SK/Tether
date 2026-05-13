# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-04-29

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

- **Gemini artifacts:** Cade asked to delete all `.gemini` workspace artifacts after they showed up as lint noise. Do not recreate or preserve `.gemini/` in this repo unless explicitly requested.

## Key Learnings

- **GSD Phase 0 upload (2026-05-13):** Phase 0 is now represented as executable GSD plans under `.planning/phases/00-level-0-bunker-reconstruction/`. The plan set is docs-only: 00-01 source spec consolidation, 00-02 behavior/data contracts, 00-03 native Bunker vertical slice, and 00-04 Joint Ops/Ghost Ops fitness without hardcoded workout plans.
- **GSD Phase 0 execution (2026-05-13):** `/gsd-execute-phase 00-level-0-bunker-reconstruction` implemented the data spine, native `Level0BunkerReconstruction` screen, `useLevel0Bunker`, and `useJointFitnessPlan`. Automated checks passed; Android human UAT remains required before treating the phase as fully verified.
- **Phase 0 migration numbering (2026-05-13):** `supabase/migrations/07_avatar_loadout.sql` already exists, so behavior/question sessions landed as migration 08 and generated plans/screenshots as migration 09. Do not create a second migration 07.
- **Native route typing consolidated (2026-05-13):** `RootStackParamList` now lives in `src/native/navigation.types.ts`; native screens should import from there instead of exporting local duplicate route maps.
- **Phase 0 native target decision (2026-05-13):** Android is the first native verification target for Level 0 Bunker Reconstruction. Do not pause Phase 0 execution to choose Android vs iOS unless Cade changes this decision.
- **GitHub Actions guardrail (2026-05-13):** The web-sandbox CI should run `npm ci`, `npx tsc --project tsconfig.app.json --noEmit`, and `npm run lint`. Current lint exits 0 but reports two warnings from vendored `.claude/get-shit-done` and `.gemini/get-shit-done` files; do not treat those as app-source failures unless ESLint is later tightened to fail on warnings.
- **React hooks lint rule (2026-05-13):** `react-hooks/set-state-in-effect` flags state setters called directly in effect bodies, including callbacks like `loadProfile()` when they synchronously set state before the first await. Use event handlers, derived initial state, or schedule work after the effect body when preserving the existing async fetch shape.

## Core Product Laws (Feu Follet Charter)

- Tether's goal is to make itself unnecessary
- No hardcoded workouts. Ever.
- Sub button on every step. No exceptions.
- Wipe data button is real. Test it.
- Kill switch hardcoded: ads run or anything sold = everything wipes
- Never rebuild PushDayOnboarding
- 3 questions max for onboarding
- Spec in Notion before writing code

## Intelligence Layer — What This Actually Is

The product is behavioral pattern detection before the user is aware.
Screenshot ingestion → pattern detection → pendulum warning before the crash.
The SOS/modules/themes are the delivery surface. The intelligence layer is the product.

## Planned Tables (not yet migrated — Migration 07+)

- noseyquestions_log
- accounts (screenshot-inferred, not bank-connected)
- transactions
- envelopes
- pantry_items
- behavioral_logs
- pendulum_events

## Level 0 / Phase 0 — Bunker Reconstruction

- Canonical jumping-off point is saved in `.planning/LEVEL_0_BUNKER_RECONSTRUCTION.md` and `.planning/BUILD_PLAN.md`.
- The first playable loop is not cozy productivity and not avatar armor drops: a destroyed base is rebuilt by real tasks while household chaos attacks it.
- Fun is a product requirement. Parenting should be emotionally honest and lighthearted where possible: babies, toddlers, teenagers, bills, groceries, missed sleep, and overwhelm can attack the base.
- Level 0 supports Military, Ethereal, and Mixed/Both modes.
- Use silent degradation, visible locked room doors, earned Intel Drops, HUD evolution, and household base-attack events as the reward loop.
- Three-week target: prove one fun vertical slice before scaling modules.
- **Personal priority (Cade + wife):** Fitness, Joint Ops, and Ghost Ops are the first practical use case because Cade and his wife need to get back to it together. Level 0 should support that need, not postpone it behind cooking/finance.
- **Approved Phase 0 tooling:** Zustand for Bunker/state/scores/degradation; Reanimated 4 for native animation/transitions; React Native Skia for GPU HUD/particles/bunker visuals; Supabase + pgvector for personalized task/workout suggestions and adaptive memory retrieval.

## OpenWolf Cron Setup Note

- On this Windows machine, `openwolf --version` works (`1.0.4`) and `openwolf status` reports core files/hooks healthy, but `openwolf daemon start` fails because `pm2` is missing.
- OpenWolf suggests `pnpm add -g pm2`, but `pnpm` is not installed here. Use `npm install -g pm2` instead, then rerun `openwolf daemon start`.
- **Resolved 2026-05-13:** `npm install -g pm2` installed PM2 7.0.1. `openwolf daemon start` launched `openwolf-Tether_Safe`; `openwolf status` reports daemon running and `.wolf/cron-state.json` has `engine_status: "running"` with a recent heartbeat.

- **FitnessOnboardingGrid web port:** Cannot import from `src/native/screens/` in the Vite build (excluded via tsconfig). Domain/Activity data must be replicated locally in web components.
- **AI gate order (Iron domain):** Always `trickycardio()` first (hard block — no cardio = no access), then `bitchweights()` (soft block — AMRAP mode, user can proceed after acknowledgement).
- **Onboarding overlay z-stack:** Identity upgrade modal is `z-20`; onboarding overlay must be `z-30` to sit above it. Canvas is `z-0`, UI overlay is `z-10`.
- **completeOnboarding() prop type:** FitnessOnboardingGrid accepts `onComplete: () => Promise<void>` — pass `completeOnboarding` directly from `useTetherState` (signatures match). DB-first pattern: profile state updates after Supabase confirms, causing the overlay to unmount automatically.
- **Valkyrie gear loadout:** MILITARY mode → `Shadow Visor [ELITE]` + `Carbon Thruster [COMMON]`; ETHER mode → `Shimmer Crown [PRIME]` + `Ethereal Flight-Span [PRIME]`. Computed from `VALKYRIE_MANIFEST.gear.helmets/wings[0|1]` by index — safe with `as const`.
- **Project:** tether
- **Description:** React Native (Expo) universal activity tracker. **Mobile only** — the Vite web shell is a dev sandbox, not the product.
- **Primary target:** Expo native app (`src/native/`). All product decisions should prioritise the native experience.
- **Architecture split:** `src/native/` is Expo/RN only — excluded from `tsconfig.app.json` via `"exclude": ["src/native"]`. The Vite web build never touches it; the native build needs its own tsconfig/metro config.
- **shimmer_mode flow:** Driven via navigation params `FitnessOnboardingGrid → PushDayOnboarding({ shimmerMode })` → persisted in `workouts.shimmer_mode` on sync. Type: `ShimmerMode` from `src/registry/valkyrie/houses.ts`.
- **useTetherState pattern:** All profile state mutations follow DB-first → then `setProfile(data)`. Never optimistic-update local state before Supabase confirms.
- **staticLevel slider:** Controls `MeshDistortMaterial distort` prop on ShimmerCore. Range 0–100, passed as `staticLevel / 100`. Initial value 40 (matches original hardcoded 0.4).
- **Auth upgrade pattern:** Use `supabase.auth.updateUser({ email, password })` — NOT signOut+signIn — to convert anonymous users. This preserves the UUID and all linked data. The anonymous session's `is_anonymous` flag becomes `false` automatically.
- **is_anonymous detection:** Cast `session.user` as `{ is_anonymous?: boolean }` — the property exists in the Supabase auth JWT but isn't in the TS SDK types. Used in EntryGate and WarRoom to distinguish Ghost vs. registered operatives.
- **userId threading:** `EntryGate.onEnter(mode, userId)` passes userId up to `App`, which stores it and passes to `WarRoom`. WarRoom calls `useTetherState(userId)` independently. This pattern avoids prop-drilling auth state through unrelated components.
- **isUntracked vs isGhost:** `isUntracked = !isLoading && !userId` — total auth failure (Supabase unavailable). `isGhost` in WarRoom = user has anonymous session (`is_anonymous: true`) — upgradeable. These are different conditions requiring different UI responses.

- **Expo native entry point:** EAS Build requires `"main": "index.js"` in package.json + a root `index.js` that calls `registerRootComponent(NativeApp)`. Without `"main"`, Expo cannot find the entry.
- **app.json minimum fields for EAS:** Must have `name`, `slug`, `version`, `platforms`, `android.package` + `extra.eas.projectId`. A minimal stub with only `extra.eas` will fail the build.
- **Missing nav packages for EAS:** The native screens require `@react-navigation/native`, `@react-navigation/native-stack`, `react-native-screens`, `react-native-safe-area-context` — none are in Expo's transitive dependencies. They must be in package.json.
- **babel.config.js required:** Expo Metro build needs `babel.config.js` with `babel-preset-expo`. Without it, Metro cannot transpile JSX/TS.
- **metro.config.js format:** Must be named `metro.config.cjs` (not `.js`) when `"type": "module"` is in package.json. Node treats `.js` as ESM in that case, so `require()` fails and metro falls back to pure defaults — silently stripping all Expo transformer config including `_expoRelativeProjectRoot`. The `.cjs` extension forces CJS regardless of package type. Metro's resolver explicitly searches for `.cjs` in addition to `.js`.
- **NativeApp.tsx placement:** Goes in `src/native/` (not `src/native/screens/`). It's the Navigator root, not a screen. Imported by `index.js` via relative path.

- **Synthesis module location:** `src/logic/synthesis/` — pure TypeScript logic, no React. Consumed by screen layers; never imported from `src/native/` directly until a consumer screen is built.
- **DailyPlanEvent.alternate invariant:** `alternate: DailyPlanAlternate` is non-nullable. The synthesizer must always populate it. Never make it optional. This is the contract that enables "Alternate" buttons in any UI consumer.
- **Domain alternate map (iron→mat, road→hub, mat→hub, hub→mat):** Always cross-domain — the alternate must require different equipment/environment than the primary event.
- **Checkpoint alternate:** Always `hub/Defer to Next Cycle` — checkpoints don't have a natural movement alternate.
- **LEARNING_VELOCITY.log:** Lives at project root. Append new entries whenever a significant architecture decision, pattern, schema change, or module is added. Format: `[YYYY-MM-DD] | TYPE | DESCRIPTION`.
- **task-observer skill:** Not registered in this Claude Code environment. OPENWOLF protocol (anatomy + cerebrum checks) serves as the equivalent session start ritual.

## Key Learnings

- **SPEC-002 TetherStateReturn (2026-05-01):** `useTetherState` now returns `{ state, isLoading, error, sync, updateTheme, triggerKillSwitch }`. Old fields (`profile`, `uiConfig`, `isUntracked`, `triggerCrisisMode`, `exitCrisisMode`, `completeOnboarding`, `bitchweights`, `trickycardio`) are gone. Callers must migrate: `profile→state`, `uiConfig` derive from `state?.is_crisis_mode`, `isUntracked` derive from `!state && !isLoading`.
- **ValkyrieTheme type:** Defined in `useTetherState.ts` as `'MILITARY' | 'ETHER'` — aligns with `JointOp.shimmer_mode` in supabase.ts. Used by `updateTheme()`.
- **TetherState vs Profile:** `TetherState` extends `Profile` with `is_nightmare_active`, `theme_state: ValkyrieTheme`, and `last_sync_timestamp`. Fields pending DB migration 06 — `toTetherState()` supplies safe defaults (`false`, `'MILITARY'`, `now()`).
- **triggerKillSwitch pattern:** Fire-and-forget (`() => void`). Clears local state immediately, then calls `supabase.auth.signOut()` async without awaiting. Ethics Charter requirement.
- **npx tsc --noEmit uses composite build cache:** Always use `npx tsc --project tsconfig.app.json --noEmit` to get accurate per-file error output for the web build. The root `npx tsc --noEmit` may return 0 due to cached tsbuildinfo even when callsite errors exist.
- **verbatimModuleSyntax pattern for native files:** All type-only named imports must use `import { type Foo }` or `import type { Foo }`. Value+type mixed: `import { value, type TypeOnly } from '...'`. Pure type: `import type { Foo } from '...'`.
- **React import in native files:** Do NOT import React at the top of native files — `react/jsx-runtime` handles it. `import React from 'react'` triggers TS6133 (unused) with `noUnusedLocals: true`.
- **@types/node required for native scope:** `NodeJS.Timeout` in HubSession and `process.env` in supabase.ts both need `@types/node` installed and `"node"` in tsconfig `types[]`.
- **Pre-existing error in supabase.ts:** `process` is not found (TS2591) — needs `@types/node`. Pre-dates SPEC-002, unrelated to hook refactor.

- **CNG (Continuous Native Generation):** Project uses CNG — `android/` and `ios/` are gitignored and generated fresh by `expo prebuild` during EAS Build. Never commit or manually edit native folders. EAS Build detects absence and runs prebuild automatically.
- **metro.config.cjs import:** Must use `require('expo/metro-config')`, NOT `require('@expo/metro-config')`. The latter is the legacy package path that diverges in behaviour.
- **expo-modules-core patch obsolete:** The `patches/expo-modules-core+55.0.24.patch` that added `-lc++_shared` is now included natively in the published package. No patch needed. If reinstating patch-package, regenerate from scratch.
- **patch-package removed:** No `postinstall` hook, no `patch-package` dep. If a future patch is needed, re-add `patch-package` to devDeps and add a `postinstall: "patch-package"` script.
- **Expo 55 aligned versions (2026-05-03):** react@19.2.0, react-dom@19.2.0, typescript@~5.9.2. Do not upgrade react/react-dom above 19.2.0 or typescript above 5.9.x without checking `npx expo install --check`.

- **Impeccable skill (2026-05-05):** Installed to `.agents/skills/impeccable/` with symlink to `.claude/skills/impeccable`. Use `npx skills@1.5.3 add pbakaus/impeccable --yes` for non-interactive install. Requires PRODUCT.md at project root (run `/impeccable teach` or create manually). DESIGN.md is a separate step (`/impeccable document`). Reads both files before any design task.
- **RootStackParamList consolidation:** Native route types are centralized in `src/native/navigation.types.ts`. Do not reintroduce local `RootStackParamList` exports from screen files.

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->
