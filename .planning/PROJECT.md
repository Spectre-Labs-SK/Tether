# Tether

## What This Is

Tether is an AI-first household executive function system for overwhelmed households. Phase 0 is Level 0 Bunker Reconstruction: real household actions rebuild a damaged base while chaos attacks it, with behavior logging active from first interaction.

The native app is the product. The Vite web build is a development sandbox.

## Core Value

Make household executive function visible, playable, and gradually unnecessary by turning real actions into adaptive support rather than dependency.

## Requirements

### Validated

- Phase 0 source docs validated as AI-first Bunker Reconstruction.
- Phase 0 behavior/data contracts implemented with Supabase migrations and central TypeScript types.
- Level 0 Bunker Reconstruction native slice implemented; Android human UAT pending.

### Active

- [ ] Complete Android human UAT for the Level 0 Bunker Reconstruction loop.
- [ ] Build the real wipe-data UI/action path.

### Out of Scope

- Hardcoded workout-plan foundations - current product direction is adaptive AI planning.
- Direct bank-account access or automated money movement - Tether gives instructions, the user acts.
- Phase 1 module expansion - Level 0 must prove the core loop first.
- Claims to diagnose or treat medical/mental-health conditions - language must stay non-clinical unless reviewed.

## Context

- Current phase: `00-level-0-bunker-reconstruction`.
- Primary verification target: Android native.
- OpenWolf remains broad project memory; `.planning/` is the GSD execution surface.
- Source specs intentionally live at `.planning/BUILD_PLAN.md`, `.planning/LEVEL_0_BUNKER_RECONSTRUCTION.md`, `.planning/INTELLIGENCE_LAYER.md`, `.planning/FITNESS_PLAN.md`, and `.planning/TETHER_ML_ARCHITECTURE.md`.

## Constraints

- **Product law:** No hardcoded workouts. AI generates/adapts plans from high-yield questions and behavior signals.
- **Trust:** Wipe data must be real and testable.
- **Ethics:** Kill switch is hardcoded if ads, in-app selling, or third-party data sharing appear.
- **Finance:** Screenshots only. No direct bank access.
- **Scope:** Do not start Phase 1 until the Level 0 loop is understandable in under 30 seconds.
- **Native-first:** Product decisions prioritize Expo native, especially Android for Phase 0.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Phase 0 is Level 0 Bunker Reconstruction | The first slice must prove the fun loop, not a generic productivity shell | Implemented; UAT pending |
| Fitness is Joint Ops/Ghost Ops adaptive support | Cade and his wife need fitness momentum, but it must not become hardcoded workout infrastructure | Implemented; UAT pending |
| Behavior tracking starts on first interaction | Adaptation depends on real skip, substitute, shuffle, defer, and correction signals | Implemented |
| Screenshot ingestion is storage-first | Screenshots provide finance signal without bank connectivity | Contract implemented |
| Android is first native target | Reduces verification ambiguity for Phase 0 execution | Confirmed |

---
*Last updated: 2026-05-13 after Phase 00 execution*
