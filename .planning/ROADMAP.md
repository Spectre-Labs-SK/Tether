# ROADMAP — Tether

**Project:** Tether — React Native (Expo) universal activity tracker  
**Aesthetic:** Dark military terminal  
**Entry:** Domain-agnostic 3-taps-to-active onboarding

---

## Milestone 1 — Foundation

### Phase 01 — Pattern Observer / Three.js
**Goal:** Establish the Zustand-to-Three.js bridge pattern and a live signal-driven ShimmerCore sphere. React state (app mode, SOS, gate states) maps to visual parameters via usePatternObserver → Zustand → ShimmerCore/useFrame without React re-renders.
**Depends on:** —
**Status:** COMPLETE (14/15 verified, human UAT closed 2026-04-28)
**Plans:**
- 01-01: Zustand bridge + canonical ShimmerCore extraction
- 01-02: usePatternObserver nine-state priority chain
- 01-03: Build pipeline validation + Zustand install

---

### Phase 02 — Nervous System Integration
**Goal:** Supabase Auth, Realtime state sync, and SOS pulse canvas implementation.
**Depends on:** Phase 01
**Status:** Not planned
**Plans:** TBD

---

## Backlog

### Phase 999.1: Resolve Git push rule violations (BACKLOG)

**Goal:** Identify and comply with repository rule set preventing push, adjust branch workflow, and push successfully.

**Plans:**
- Review branch protection settings on GitHub.
- Ensure commits are signed and pass CI checks.
- Rebase onto target branch if required.
- Push or open a PR as per policy.

**Dependencies:** None

