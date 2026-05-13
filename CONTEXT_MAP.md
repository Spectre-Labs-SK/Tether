# TETHER CONTEXT MAP

## Current Product Spine

- **Behavior tracking from download:** every module starts collecting useful interaction signals immediately, with user trust and Feu Follet data limits enforced in code.
- **AI-first plan generation:** Tether should ask at most 3 high-yield questions, infer the rest cautiously, and draft an adaptive plan.
- **Adaptive controls:** skip, substitute, shuffle, defer, and "Can I afford this?" actions are first-class behavior signals, not UI extras.
- **Themes and hidden themes:** dopamine architecture and progression layer. They are not cosmetic skins.
- **Bunker:** the user's safe base after onboarding/SOS, later evolving into House/Farm/etc. through hidden theme progression.
- **Household executive function:** groceries, finances, envelopes, debt snowball, pantry velocity, and task automation are part of the same system.

## Source Of Truth

- **Notion:** product intent, specs, info dumps, and module concepts.
- **Repo:** executable implementation only. Treat old hardcoded domain/workout screens as legacy until replaced.
- **Compiler/tests:** implementation auditor.
- **Cade:** product governor and final decision maker.
- **Codex/Claude:** execution partners. No legacy governor or local lead-dev assumption.

## Current Implementation Hubs

- **State/Auth:** `src/hooks/useTetherState.ts`, `src/lib/supabase.ts`
- **Web sandbox:** `src/App.tsx`, `src/components/BunkerGate.tsx`, `src/components/WarRoom.tsx`, `src/components/ShimmerCore.tsx`
- **Legacy native workout screens:** `src/native/screens/` currently contains hardcoded workout/domain flows that do not match the current AI-first product direction.
- **Theme fragments:** `src/registry/avatar/themes.ts`, `src/registry/avatar/`, `src/registry/valkyrie/`
- **Synthesis fragment:** `src/logic/synthesis/` has DailyPlan logic but no UI consumer and does not yet reflect the current 3-question AI planning model.

## Guardrails

- No hardcoded workouts as product foundation.
- No AI API keys in the app bundle; AI calls go through Supabase Edge Functions.
- No bank-account access or automated money movement. Tether gives instructions; the user executes.
- Behavior data belongs to the user. Kill switch and wipe flows are non-negotiable.
