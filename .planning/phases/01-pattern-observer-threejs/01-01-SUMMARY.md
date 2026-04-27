---
phase: 01-pattern-observer-threejs
plan: "01"
subsystem: shimmer-core
tags: [zustand, three-js, r3f, store-bridge, animation]
dependency_graph:
  requires: []
  provides: [patternStore, ShimmerCore-canonical]
  affects: [WarRoom, Phase-01-02-wiring, Phase-01-03-observer]
tech_stack:
  added: [zustand]
  patterns: [zustand-getState-in-useFrame, pre-allocated-THREE-Color, reactive-float-props]
key_files:
  created:
    - src/stores/patternStore.ts
  modified:
    - src/components/ShimmerCore.tsx
    - src/components/WarRoom.tsx
decisions:
  - "Use usePatternStore.getState() inside useFrame (non-reactive) — hooks cannot be called inside the R3F render loop"
  - "Pre-allocate _targetColor at module scope using new THREE.Color() — avoids per-frame GC allocation at 60fps"
  - "floatIntensity and floatSpeed read as reactive selectors outside useFrame so <Float> re-renders only on domain transitions"
  - "DEFAULTS correspond to gate/idle state: distort=0.15, color='#1e293b', metalness=0.9"
metrics:
  duration: "~8 minutes"
  completed: "2026-04-26"
  tasks_completed: 2
  files_changed: 3
---

# Phase 01 Plan 01: Zustand Bridge and Canonical ShimmerCore Summary

Zustand store (patternStore) and canonical store-driven ShimmerCore established as the two foundational artifacts for the pattern-observer-threejs phase.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create src/stores/patternStore.ts | 951fcd5 | src/stores/patternStore.ts (created) |
| 2 | Rewrite src/components/ShimmerCore.tsx | c210765 | src/components/ShimmerCore.tsx (replaced) |

## What Was Built

**patternStore.ts** — Zustand store that serves as the contract between React state (Plan 01-02) and the Three.js render loop.
- `ShimmerTarget` type: distort, color, speed, metalness, emissiveIntensity, floatIntensity, floatSpeed
- `DEFAULTS` constant: idle/gate state values
- `usePatternStore` with `setTarget(Partial<ShimmerTarget>)` partial-merge reducer

**ShimmerCore.tsx** — Canonical zero-props component. Completely replaces the old props-based version (mode, staticLevel).
- Reads floatIntensity and floatSpeed as reactive Zustand selectors outside useFrame
- Uses `usePatternStore.getState()` inside useFrame — the non-reactive R3F bridge pattern
- Lerps distort, speed, metalness, and color toward store target at LERP=0.04 each frame
- Pre-allocated `_targetColor` module-level constant: `.set(target.color)` instead of `new THREE.Color()` inside the loop

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Remove stale ShimmerCore props from WarRoom caller**

- **Found during:** Post-Task 2 verification
- **Issue:** `WarRoom.tsx` line 125 called `<ShimmerCore mode={mode} staticLevel={staticLevel} />` — ShimmerCore no longer accepts any props, so this would fail TypeScript typecheck
- **Fix:** Replaced with `<ShimmerCore />` (zero props)
- **Files modified:** src/components/WarRoom.tsx
- **Commit:** bc94e28

## Known Stubs

None — both files are fully implemented with no placeholder values or TODO markers.

## Threat Surface Scan

T-01-02 mitigation applied: `_targetColor` pre-allocated at module scope; no `new THREE.Color()` inside `useFrame`. No new network endpoints, auth paths, or schema changes introduced.

## Self-Check: PASSED

- src/stores/patternStore.ts exists: FOUND
- src/components/ShimmerCore.tsx exists: FOUND
- Commits 951fcd5, c210765, bc94e28: FOUND in git log
- `export const usePatternStore` at line 28: FOUND
- `export function ShimmerCore()` at line 12: FOUND
- `usePatternStore.getState` at line 24: FOUND
- `_targetColor.set` at line 31: FOUND
- No ShimmerCoreProps/staticLevel/mode strings in ShimmerCore.tsx: CONFIRMED (grep count=0)
