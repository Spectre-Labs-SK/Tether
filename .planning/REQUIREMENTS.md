# Requirements — Phase 00 Level 0 Bunker Reconstruction

Status values:

- `implemented` means code/docs exist and automated checks passed.
- `human_needed` means Android/manual verification is still required.

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| P0-SPEC-CONSOLIDATION | Phase 0 docs consistently describe AI-first Bunker Reconstruction. | implemented | `.planning/FITNESS_PLAN.md`, `.planning/TETHER_ML_ARCHITECTURE.md`, `00-01-SUMMARY.md` |
| P0-NO-HARDCODED-WORKOUTS | Fitness is adaptive support, not a fixed workout foundation. | implemented | `.planning/FITNESS_PLAN.md`, `useJointFitnessPlan.ts` |
| P0-BEHAVIOR-EVENTS | Every meaningful user action is logged from first interaction. | implemented | `behavior_events`, `plan_actions`, `useLevel0Bunker.ts`, `useJointFitnessPlan.ts` |
| P0-WIPE-DATA | Full data deletion is real and testable. | human_needed | Contract documented in `.planning/data-model.md`; UI execution remains future trust-control work |
| P0-KILL-SWITCH-STUB | Hardcoded kill switch contract exists before growth work. | implemented | `.planning/data-model.md`, `behavior_events` trust actions |
| P0-SCREENSHOT-INGESTION | Screenshot upload/storage path exists before parsing. | implemented | `screenshot_ingestions` migration and `ScreenshotIngestion` type |
| P0-BUNKER-VERTICAL-SLICE | Native Level 0 loop is playable. | human_needed | `Level0BunkerReconstruction.tsx`; Android manual verification pending |
| P0-VISUAL-MODES | Military, Ethereal, and Mixed modes are represented. | human_needed | `Level0BunkerReconstruction.tsx`; screenshots pending |
| P0-CHAOS-EVENT | Household chaos attacks the base without shaming the user. | human_needed | `useLevel0Bunker.ts`, `Level0BunkerReconstruction.tsx`; manual copy/feel check pending |
| P0-INTEL-DROP | One earned `// INTEL RECOVERED` moment exists. | human_needed | `Level0BunkerReconstruction.tsx`; manual tap path pending |
| P0-JOINT-OPS-FITNESS | Shared fitness momentum is supported as a Bunker mission. | human_needed | `useJointFitnessPlan.ts`, `Level0BunkerReconstruction.tsx`; Android manual verification pending |
| P0-GHOST-OPS | Quiet participation is supported. | human_needed | `useJointFitnessPlan.ts`, `Level0BunkerReconstruction.tsx`; Android manual verification pending |
| P0-THREE-QUESTION-MAX | Onboarding/planning asks at most three high-yield questions. | implemented | `QUESTIONS` constant in `useJointFitnessPlan.ts` |
| P0-ADAPTIVE-ACTIONS | Skip, substitute, shuffle, defer, and correction are first-class behavior signals. | implemented | Hook handlers, screen controls, behavior/plan action migrations |
