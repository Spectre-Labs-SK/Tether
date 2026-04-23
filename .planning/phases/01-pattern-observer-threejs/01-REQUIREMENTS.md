# Phase 01 — Pattern Observer & Three.js State Mirroring
# Requirements

---

## PAT-01: Zustand patternStore with ShimmerTarget type and visual state constants

Create `src/stores/patternStore.ts` containing:
- `ShimmerTarget` — exported TypeScript type describing the seven visual parameters: `distort`, `color`, `speed`, `metalness`, `emissiveIntensity`, `floatIntensity`, `floatSpeed`
- `DEFAULTS` — exported constant of type `ShimmerTarget` representing the idle/gate visual state (`color: '#1e293b'`, `distort: 0.15`, `speed: 1`, `metalness: 0.9`, `emissiveIntensity: 0`, `floatIntensity: 0.5`, `floatSpeed: 1`)
- `usePatternStore` — exported Zustand store holding `target: ShimmerTarget` and `setTarget(next: Partial<ShimmerTarget>): void`

The store is the single source of truth bridging React state (Plan 02) to the Three.js render loop (Plan 01). It must be a pure Zustand module with no React component imports.

---

## PAT-02: ShimmerCore rewritten to zero-prop, reads store via getState() in useFrame with pre-allocated _targetColor

Completely replace `src/components/ShimmerCore.tsx`. The new component:
- Exports `function ShimmerCore()` with zero parameters (no props)
- Reads `distort`, `speed`, `metalness`, and `color` from the store inside `useFrame` using `usePatternStore.getState()` (non-reactive direct read — hooks cannot be called inside useFrame)
- Lerps each material property toward the store target each frame using `THREE.MathUtils.lerp` at `LERP = 0.04`
- Uses a module-level pre-allocated `_targetColor = new THREE.Color('#1e293b')` constant and calls `_targetColor.set(target.color)` inside useFrame — never `new THREE.Color(target.color)` inside the frame loop (GC safety at 60fps)
- Reads `floatIntensity` and `floatSpeed` via reactive Zustand selectors outside `useFrame` so `<Float>` re-renders only on domain transitions, not every frame
- The old `ShimmerCoreProps` type (`mode`, `staticLevel`) is entirely deleted

---

## PAT-03: Float props (floatIntensity, floatSpeed) driven via reactive Zustand selector outside Canvas

The `<Float>` component in `ShimmerCore.tsx` receives `speed` and `floatIntensity` from reactive Zustand selectors declared outside the `useFrame` callback:

```typescript
const floatIntensity = usePatternStore((state) => state.target.floatIntensity);
const floatSpeed = usePatternStore((state) => state.target.floatSpeed);
```

This ensures `<Float>` re-renders only when the store's float values change (i.e., on domain transitions), not on every animation frame. These values cannot be mutated imperatively in `useFrame` because `<Float>` is a React component, not a Three.js object.

---

## PAT-04: usePatternObserver hook created with nine-state priority logic

Create `src/hooks/usePatternObserver.ts` containing:
- `Domain` — exported type union: `'Iron' | 'Road' | 'Mat' | 'Hub'`
- `PatternSignals` — exported type with fields: `appMode`, `shimmerMode`, `isCrisisMode`, `selectedDomain`, `liftingGated`, `bitchweightCount`
- `usePatternObserver(signals: PatternSignals): void` — exported hook that calls `setTarget` via `usePatternStore` in a `useEffect`

The hook implements nine visual states in strict priority order:

| Priority | Condition | color | distort | speed | metalness | floatIntensity | floatSpeed |
|----------|-----------|-------|---------|-------|-----------|----------------|------------|
| 1 (highest) | `appMode === 'sos'` OR `isCrisisMode` | #f472b6 | 0.9 | 4 | 0.3 | 3 | 6 |
| 2 | `liftingGated === true` | #f59e0b | 0.7 | 3 | 0.6 | 1.5 | 3 |
| 3 | `bitchweightCount > 0` | #ef4444 | 0.8 | 4 | 0.7 | 2 | 4 |
| 4a | `selectedDomain === 'Iron'` | #475569 | 0.5 | 3 | 0.95 | 1 | 2 |
| 4b | `selectedDomain === 'Road'` | #0ea5e9 | 0.6 | 3.5 | 0.5 | 2 | 3.5 |
| 4c | `selectedDomain === 'Mat'` | #a78bfa | 0.35 | 1.5 | 0.4 | 2.5 | 1.5 |
| 4d | `selectedDomain === 'Hub'` | #10b981 | 0.2 | 1.5 | 0.7 | 1 | 1.5 |
| 5a | `appMode === 'gate'` (idle) | #1e293b | 0.15 | 1 | 0.9 | 0.5 | 1 |
| 5b | `appMode === 'chill'` + MILITARY | #1e293b | 0.3 | 2 | 0.8 | 1 | 2 |
| 5c | `appMode === 'chill'` + ETHER | #6d28d9 | 0.4 | 2.5 | 0.6 | 1.5 | 2.5 |

The `useEffect` dependency array lists each signal field individually (not the `signals` object) to avoid stale-closure bugs.

---

## PAT-05: appMode=sos / crisis_mode → hot pink maximum distort visual state

When `appMode === 'sos'` OR `isCrisisMode === true`, `usePatternObserver` calls:

```typescript
setTarget({ color: '#f472b6', distort: 0.9, speed: 4, metalness: 0.3, floatIntensity: 3, floatSpeed: 6 });
```

This is Priority 1 — it overrides all other conditions including liftingGated and bitchweightCount.

`usePatternObserver` is mounted in both `WarRoom` (passing the live `appMode` prop) and `SOSShell` (hardcoding `isCrisisMode: true`) so the sphere animates in SOS state whenever `SOSShell` is visible.

---

## PAT-06: trickycardio gate → amber warning visual state (Phase 1 stub — userId always null)

When `liftingGated === true`, `usePatternObserver` calls:

```typescript
setTarget({ color: '#f59e0b', distort: 0.7, speed: 3, metalness: 0.6, floatIntensity: 1.5, floatSpeed: 3 });
```

**Phase 1 stub status:** `userId` is always `null` in this phase because `EntryGate` does not pass `userId` back to `App()`. The `liftingGated` state is declared and wired in `WarRoom`, but the `resolve()` async function guards on `userId` and returns early without calling `trickycardio()`. This state is registered but will never fire in Phase 1. Phase 2 wires `userId` through `App()`.

---

## PAT-07: bitchweights flags → red alert visual state (Phase 1 stub — userId always null)

When `bitchweightCount > 0`, `usePatternObserver` calls:

```typescript
setTarget({ color: '#ef4444', distort: 0.8, speed: 4, metalness: 0.7, floatIntensity: 2, floatSpeed: 4 });
```

**Phase 1 stub status:** Same as PAT-06 — `userId` is always `null` in this phase. The `bitchweightCount` state is declared and wired in `WarRoom`, but the `resolve()` async function returns early without calling `bitchweights()`. This state is registered but will never fire in Phase 1. Phase 2 wires `userId` through `App()`.

---

## PAT-08: C-003 resolved — inline ShimmerCore deleted from App.tsx, components/ShimmerCore.tsx canonical

Codebase concern C-003 (ShimmerCore is inline in `App.tsx`) is resolved by this phase:
- The inline `const ShimmerCore = ({ mode, distort }) => (...)` definition in `App.tsx` is completely deleted
- `src/components/ShimmerCore.tsx` is the single canonical location for the component
- `App.tsx` imports `ShimmerCore` from `'./components/ShimmerCore'`
- `<ShimmerCore />` is rendered with zero props in the Canvas

After Plan 01-03 completes, `CONVENTIONS.md` is updated to note Zustand as the approved exception for R3F state bridging (overriding the prior "Local useState only" rule).
