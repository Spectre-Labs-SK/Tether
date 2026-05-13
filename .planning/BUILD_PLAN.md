# Tether Build Plan

## Phase 0 — Level 0: Bunker Reconstruction

**Goal:** Prove the core fun loop before expanding modules.

The first playable surface is the destroyed base. The user rebuilds it with real-world actions. Household chaos attacks it. The system should feel funny, honest, and playable, not cozy, preachy, or productivity-coded.

**Personal priority:** Cade and his wife need Fitness, Joint Ops, and Ghost Ops first so they can get back to training together. The first slice should use the Bunker loop to make shared fitness momentum fun, not defer fitness until later.

### Phase 0 Scope

- Military / Ethereal / Mixed Level 0 visual direction.
- Silent degradation and recovery.
- Real task completion changes the scene.
- One visible room door unlock path.
- Earned Intel Drop.
- One household chaos/base attack event.
- Behavior event logging from first interaction.
- Joint Ops / Ghost Ops framing for two-person accountability.
- No hardcoded workout plan.
- No avatar/armor-drop economy unless it directly improves the base loop.

### GSD Phase 0 Plans

The executable GSD plan set now lives in
`.planning/phases/00-level-0-bunker-reconstruction/`:

- `00-01-PLAN.md` — product/spec consolidation and missing source docs.
- `00-02-PLAN.md` — behavior-event model, screenshot ingestion contracts, wipe data, kill switch stub, and migrations.
- `00-03-PLAN.md` — native Level 0 Bunker vertical slice.
- `00-04-PLAN.md` — Joint Ops/Ghost Ops fitness framing without hardcoded workout plans.

### Approved Phase 0 Tooling

| Tool | Why |
|---|---|
| Zustand | Best-fit React Native state management for scores, gear, degradation state, Bunker state, and lightweight cross-screen state. Already installed. |
| Reanimated 4 | Native animation standard. Degradation, recovery, room unlocks, and skin transitions are core UX, not decoration. |
| React Native Skia | GPU-accelerated native visuals for HUD overlays, particle/intel drops, bunker effects, and performant non-DOM scene layers. |
| Supabase + pgvector | Existing backend spine. pgvector supports personalized task/workout suggestions and memory retrieval as the ML pillar grows. |

Do not add visual tooling as candy. Each tool must directly support the Level 0 Bunker + Fitness/Joint/Ghost Ops loop.

### Success Test

A stressed parent should understand the joke and the game in under 30 seconds:

> "The house is under attack. We are rebuilding the base. Do one real thing and the base gets better."

If it feels like a wellness checklist, it fails.

### Next Phase Gate

Do not start full finance, cooking, or fitness implementation until Phase 0 proves:

- the base reaction loop feels satisfying,
- skip/sub/shuffle/defer actions are captured as behavior,
- the chaos layer changes mood instead of adding shame,
- the visual system works in Military, Ethereal, and Mixed modes.
