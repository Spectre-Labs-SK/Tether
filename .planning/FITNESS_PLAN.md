# Fitness Plan — Phase 0 Source Spec

**Status:** Phase 0 planning input. This replaces the legacy hardcoded fitness
selector idea with an AI-first, behavior-driven fitness loop.

## Product Law

Fitness is not the foundation of Tether, and Tether must not build a hardcoded
Iron/Road/Mat/Hub workout selector as the product base.

Fitness in Phase 0 exists because Cade and his wife need a practical way to get
moving together again. It should support the Level 0 Bunker loop, Joint Ops, and
Ghost Ops without pretending a static workout plan is the product.

## Phase 0 Fitness Role

Fitness is the first practical use case inside Bunker Reconstruction:

- A real exercise action repairs or upgrades the base.
- Partner accountability is framed as Joint Ops, not pressure.
- Ghost Ops allows a user to participate quietly without social friction.
- Every skip, substitute, shuffle, defer, and correction is a behavior signal.
- The system asks at most three high-yield questions before drafting a plan.

## Non-Negotiables

- No hardcoded workout plans.
- No fixed onboarding domain grid as the product foundation.
- No "complete the plan or fail" language.
- Every plan step must support substitute, skip, shuffle, defer, and correction.
- The AI drafts and adapts cautiously from available signals.
- Tether should help build the habit pathway, then become less necessary.

## First Vertical Slice

The first fitness slice should be tiny and real:

1. Ask up to three questions only when needed.
2. Draft a first training action for one or two household members.
3. Let either person complete, skip, substitute, shuffle, or defer the action.
4. Log the behavior event.
5. Reflect the result in the Bunker scene.

Example: completing a short movement action repairs the training corner,
stabilizes a door, or recovers a piece of base equipment. Deferring the action
does not shame the user; it quietly changes the base state and teaches the
system about timing.

## Joint Ops / Ghost Ops

Joint Ops is the shared household mode:

- One shared objective.
- Two independent energy levels.
- Each person can act without blocking the other.
- Partner visibility should reduce coordination cost, not create guilt.

Ghost Ops is the quiet participation mode:

- Minimal prompts.
- Low-pressure logging.
- User can do the action privately.
- The system still learns from corrections and substitutions.

## Signals To Capture

Phase 0 fitness should log:

- `complete` — user completed the action.
- `skip` — user intentionally skipped.
- `substitute` — user replaced the action with another.
- `shuffle` — user changed order.
- `defer` — user moved it later.
- `correction` — user corrected the system's assumption.
- `partner_response` — Joint Ops partner accepted, ignored, deferred, or changed.

The signal matters more than the workout content. The workout is the delivery
surface; behavior learning is the product.

## Out Of Scope For Phase 0

- Full training program generation.
- Exercise library expansion.
- Wearable integration.
- PR tracking and 1RM optimization.
- Hardcoded domain progression.
- Avatar or armor rewards unless they directly improve the Bunker loop.

## Acceptance Test

A stressed household should understand the first fitness loop in under 30
seconds:

> We are rebuilding the base together. Do one real movement action, or change it
> honestly, and the base reacts.
