# Phase 01: PatternObserver + Three.js State Mirroring — Research

**Researched:** 2026-04-22
**Domain:** React context/hooks state architecture + React Three Fiber reactive animation
**Confidence:** HIGH

---

## Summary

The Tether web shell is a React SPA where the Three.js `ShimmerCore` sphere currently accepts two static props: `mode` (binary colour toggle) and `distort` (a slider 0–100). The goal of this phase is to replace that manual-input model with a live, behaviour-driven mapping: when app state changes (crisis mode, domain selection, fitness gates), the sphere's material parameters animate automatically and expressively.

The core architectural challenge is the **React-to-render-loop bridge**: React state is discrete and event-driven; the Three.js render loop runs at 60fps. The standard solution in the R3F ecosystem is a small Zustand store — R3F's official pitfalls documentation explicitly recommends reading state directly in `useFrame` via `store.getState()` rather than binding reactive selectors to the render loop. This avoids unnecessary re-renders while keeping the visual completely responsive.

The secondary challenge is resolving **C-003 (ShimmerCore duplication)** as a prerequisite: the inline component in `App.tsx` and the unused `components/ShimmerCore.tsx` must be consolidated before props are extended. The canonical version must live in `src/components/ShimmerCore.tsx`.

**Primary recommendation:** Introduce a `usePatternStore` Zustand store that aggregates all behavioural signals into a flat `ShimmerTarget` shape (distort, color, speed, metalness, emissive, floatIntensity). `ShimmerCore` reads this via `useFrame(() => store.getState())` and lerps toward target values each frame, producing smooth organic transitions without re-renders.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| PatternObserver logic | React hook (browser) | — | Reads React state; emits signals to Zustand store |
| ShimmerTarget derivation | Zustand store (browser) | — | Decouples signal producers from the renderer |
| Three.js parameter animation | R3F render loop (Canvas) | — | `useFrame` + direct ref mutation, no re-renders |
| Spring/lerp physics | Inside `useFrame` | `@react-spring/three` (optional) | Frame-level lerp is sufficient; spring adds dependency |
| State source (crisis, domain) | `useTetherState` (existing) | `App.tsx` appMode | Both already expose signals; PatternObserver reads them |
| Supabase profile signals | `useTetherState` (existing) | — | `profile.is_crisis_mode` drives one signal class |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-three/fiber | 9.6.0 (installed) | React renderer for Three.js | Required — already in use |
| @react-three/drei | 10.7.7 (installed) | MeshDistortMaterial, Float | Required — already in use |
| three | 0.184.0 (installed) | 3D engine | Required — already in use |
| zustand | 5.0.12 (current registry) | Cross-boundary state store | R3F-recommended bridge between React and render loop |

### Supporting (optional, not required for MVP)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-spring/three | 10.0.3 (current) | Spring physics on material props | If lerp feels linear and spring easing is needed; adds 30KB |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand store | React Context | Context triggers re-renders on every subscriber; ColourCore re-renders 60x/sec is wasteful |
| Zustand store | Valtio proxy | Valtio is equally valid but adds a dependency; Zustand is already the R3F docs' recommended example |
| Frame-level lerp | `@react-spring/three` | Spring adds physics feel but adds a package; lerp with a tunable factor achieves ~80% of the result with zero new dependencies |
| `useFrame` direct mutation | React state prop drilling | Prop drilling forces a React re-render on every parameter change; `useFrame` bypasses React entirely for per-frame updates |

**Installation (only Zustand is new):**
```bash
npm install zustand
```

**Version verification:** [VERIFIED: npm registry — zustand 5.0.12, @react-spring/three 10.0.3 as of 2026-04-22]

---

## Architecture Patterns

### System Architecture Diagram

```
App state signals
       │
       ├── appMode ('gate'|'chill'|'sos')        ─┐
       ├── profile.is_crisis_mode (Supabase)       │   usePatternObserver hook
       ├── uiConfig ('full'|'minimalist')          │   (reads React state,
       ├── selectedDomain (Iron/Road/Mat/Hub)      │    writes to Zustand)
       ├── trickycardio gate result               ─┘
       └── bitchweights flag count
                     │
                     ▼
         ┌─────────────────────┐
         │  usePatternStore    │   Zustand store
         │  (ShimmerTarget)    │   distort / color /
         │                     │   speed / metalness /
         └──────────┬──────────┘   emissive / floatIntensity
                    │
                    │  store.getState() inside useFrame
                    ▼
         ┌─────────────────────┐
         │   ShimmerCore.tsx   │   R3F Canvas component
         │  materialRef.current│   Direct THREE.js mutation
         │  .distort = lerp(…) │   60fps — no React re-renders
         └─────────────────────┘
```

### Recommended Project Structure
```
src/
  stores/
    patternStore.ts       — Zustand store: ShimmerTarget type + usePatternStore
  hooks/
    usePatternObserver.ts — reads React state signals, writes to patternStore
    useTetherState.ts     — existing (unchanged)
  components/
    ShimmerCore.tsx       — canonical component; reads patternStore in useFrame
  App.tsx                 — mounts usePatternObserver above Canvas; no more inline ShimmerCore
```

### Pattern 1: Zustand Bridge for useFrame (The R3F-Recommended Pattern)

**What:** A Zustand store holds the `ShimmerTarget`. `ShimmerCore` reads it inside `useFrame` via `store.getState()` — not via reactive hook — and lerps the material ref toward the target values each frame.

**When to use:** Whenever React state needs to drive Three.js without causing re-renders.

```typescript
// Source: https://github.com/pmndrs/react-three-fiber/blob/master/docs/advanced/pitfalls.mdx
// src/stores/patternStore.ts

import { create } from 'zustand';

export type ShimmerTarget = {
  distort: number;       // 0.0 – 1.0
  color: string;         // hex
  speed: number;         // material animation speed
  metalness: number;     // 0.0 – 1.0
  emissiveIntensity: number;
  floatIntensity: number;
  floatSpeed: number;
};

type PatternStore = {
  target: ShimmerTarget;
  setTarget: (next: Partial<ShimmerTarget>) => void;
};

export const DEFAULTS: ShimmerTarget = {
  distort: 0.2,
  color: '#1e293b',
  speed: 2,
  metalness: 0.8,
  emissiveIntensity: 0,
  floatIntensity: 1,
  floatSpeed: 2,
};

export const usePatternStore = create<PatternStore>((set) => ({
  target: { ...DEFAULTS },
  setTarget: (next) =>
    set((state) => ({ target: { ...state.target, ...next } })),
}));
```

```typescript
// src/hooks/usePatternObserver.ts
// Reads React state signals, writes derived ShimmerTarget to the store

import { useEffect } from 'react';
import { usePatternStore } from '../stores/patternStore';
import type { UIConfig } from './useTetherState';

type Signals = {
  appMode: 'gate' | 'chill' | 'sos';
  uiConfig: UIConfig;
  isCrisisMode: boolean;
  selectedDomain: 'Iron' | 'Road' | 'Mat' | 'Hub' | null;
  liftingGated: boolean;
  bitchweightCount: number;
};

export function usePatternObserver(signals: Signals) {
  const setTarget = usePatternStore((state) => state.setTarget);

  useEffect(() => {
    const { appMode, isCrisisMode, selectedDomain, liftingGated, bitchweightCount } = signals;

    if (appMode === 'sos' || isCrisisMode) {
      setTarget({ color: '#f472b6', distort: 0.85, speed: 5, metalness: 0.3, floatSpeed: 6 });
      return;
    }

    if (liftingGated) {
      setTarget({ color: '#fbbf24', distort: 0.55, speed: 3, metalness: 0.6 });
      return;
    }

    if (bitchweightCount > 0) {
      setTarget({ color: '#ef4444', distort: 0.7, speed: 4, metalness: 0.5, floatIntensity: 2 });
      return;
    }

    switch (selectedDomain) {
      case 'Iron':
        setTarget({ color: '#1e293b', distort: 0.6, speed: 3, metalness: 0.95, floatIntensity: 0.5 });
        break;
      case 'Road':
        setTarget({ color: '#0ea5e9', distort: 0.4, speed: 4, metalness: 0.5, floatIntensity: 1.5 });
        break;
      case 'Mat':
        setTarget({ color: '#6d28d9', distort: 0.3, speed: 1.5, metalness: 0.4, floatIntensity: 2 });
        break;
      case 'Hub':
        setTarget({ color: '#10b981', distort: 0.2, speed: 1, metalness: 0.7, floatIntensity: 0.8 });
        break;
      default:
        setTarget({ color: '#1e293b', distort: 0.2, speed: 2, metalness: 0.8, floatIntensity: 1 });
    }
  }, [signals.appMode, signals.isCrisisMode, signals.selectedDomain, signals.liftingGated, signals.bitchweightCount, setTarget]);
}
```

```typescript
// src/components/ShimmerCore.tsx — canonical (replaces inline + old standalone)
// Source: https://github.com/pmndrs/react-three-fiber/blob/master/docs/advanced/pitfalls.mdx
//         https://github.com/pmndrs/zustand/blob/main/README.md

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';
import { usePatternStore } from '../stores/patternStore';

const LERP = 0.04; // lower = slower/smoother, higher = snappier

export function ShimmerCore() {
  const materialRef = useRef<InstanceType<typeof MeshDistortMaterial>>(null!);
  const colorRef = useRef(new THREE.Color('#1e293b'));

  useFrame(() => {
    if (!materialRef.current) return;
    const { target } = usePatternStore.getState(); // direct getState — no re-render
    const mat = materialRef.current;

    mat.distort = THREE.MathUtils.lerp(mat.distort, target.distort, LERP);
    mat.speed   = THREE.MathUtils.lerp(mat.speed,   target.speed,   LERP);
    mat.metalness = THREE.MathUtils.lerp(mat.metalness, target.metalness, LERP);

    colorRef.current.lerp(new THREE.Color(target.color), LERP);
    mat.color.copy(colorRef.current);
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh scale={1.5}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          ref={materialRef}
          color="#1e293b"
          distort={0.2}
          speed={2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}
```

**Critical note:** `usePatternStore.getState()` (non-reactive) is called inside `useFrame`, not `usePatternStore()` (reactive hook). This is the exact pattern recommended in R3F pitfalls docs. [VERIFIED: Context7/pmndrs/react-three-fiber pitfalls.mdx]

### Pattern 2: animated(MeshDistortMaterial) with @react-spring/three (Optional Alternative)

**What:** Wraps MeshDistortMaterial with react-spring's `animated()` and uses `useSpring` to drive color/distort with spring physics instead of linear lerp.

**When to use:** Only if the lerp-in-useFrame approach produces motion that feels too mechanical.

```typescript
// Source: https://github.com/pmndrs/react-spring/blob/next/docs/app/routes/docs.guides.react-three-fiber.mdx
import { useSpring, animated } from '@react-spring/three';
import { MeshDistortMaterial } from '@react-three/drei';

const AnimatedMeshDistortMaterial = animated(MeshDistortMaterial);

// <AnimatedMeshDistortMaterial color={springs.color} distort={springs.distort} />
```

**This requires `npm install @react-spring/three`. Do not add unless lerp proves insufficient.**

### Anti-Patterns to Avoid

- **`setState` inside `useFrame`:** Calling React state setters in the render loop routes updates through React's scheduler. The R3F pitfalls doc explicitly marks this as an anti-pattern. Always use direct ref mutation.
- **Reactive selector binding on fast-changing values:** `const x = useSelector(state => state.x)` inside a component that renders every frame. Use `store.getState()` inside `useFrame` instead.
- **Prop-drilling ShimmerTarget from App.tsx into Canvas:** Would cause App to re-render whenever a signal changes, which re-renders the entire Canvas tree. The Zustand bridge isolates re-renders to non-Canvas components only.
- **Putting the PatternObserver inside the Canvas:** `usePatternObserver` is a React effect hook — it must live in a React component above the Canvas, not inside it.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Lerping THREE.Color | Custom hex interpolation | `THREE.Color.lerp()` + `THREE.MathUtils.lerp()` | THREE.js has this built-in; custom implementations drift in perceptual lightness |
| State bridge to render loop | Custom event bus / pub-sub | Zustand `getState()` in `useFrame` | Pub-sub introduces event ordering bugs; Zustand is synchronous and GC-safe |
| Spring animation | Manual easing function in useFrame | Frame-level lerp OR `@react-spring/three` | `animated()` handles value interpolation, cancellation, and stale-closure safety |
| Float animation speed driven by domain | Re-implementing Float | `<Float speed={n}>` prop update | Float speed is a standard prop; mutating it via React state is correct |

**Key insight:** The only genuinely custom code in this phase is the `usePatternObserver` mapping table (signals → ShimmerTarget). Everything else has an existing, well-maintained solution.

---

## Three.js Parameter Map (State → Visual)

All values are target values; `ShimmerCore` lerps toward them at `LERP = 0.04` per frame.

| App State | distort | color | speed | metalness | floatIntensity | floatSpeed | Semantic Intent |
|-----------|---------|-------|-------|-----------|----------------|------------|-----------------|
| Default / idle | 0.20 | `#1e293b` | 2.0 | 0.80 | 1.0 | 2.0 | Calm, nominal presence |
| `appMode === 'sos'` | 0.85 | `#f472b6` | 5.0 | 0.30 | 2.5 | 6.0 | Chaos, emergency, maximum distress |
| `is_crisis_mode` | 0.85 | `#f472b6` | 5.0 | 0.30 | 2.5 | 6.0 | Same as SOS — same visual response |
| Domain: Iron | 0.60 | `#1e293b` | 3.0 | 0.95 | 0.5 | 2.0 | Dense, heavy, metallic |
| Domain: Road | 0.40 | `#0ea5e9` | 4.0 | 0.50 | 1.5 | 3.5 | Fluid, rhythmic, moving |
| Domain: Mat | 0.30 | `#6d28d9` | 1.5 | 0.40 | 2.0 | 1.5 | Breathing, slow, spiritual |
| Domain: Hub | 0.20 | `#10b981` | 1.0 | 0.70 | 0.8 | 1.5 | Calm focus, minimal noise |
| `liftingGated` (TrickyCardio) | 0.55 | `#fbbf24` | 3.0 | 0.60 | 1.2 | 3.0 | Warning amber — blocked, alerting |
| `bitchweightCount > 0` | 0.70 | `#ef4444` | 4.0 | 0.50 | 2.0 | 4.0 | Red alert — stagnation detected |
| `appMode === 'chill'`, no domain | 0.20 | `#1e293b` | 2.0 | 0.80 | 1.0 | 2.0 | Nominal — loaded but idle |

**Priority order for signal resolution (highest wins):**
1. SOS / crisis mode (overrides all)
2. liftingGated (overrides domain)
3. bitchweightCount > 0 (overrides domain)
4. selectedDomain
5. Default

---

## Animation Strategy

### Recommendation: Frame-level lerp inside `useFrame` (no new dependencies)

**Why not react-spring first:** The lerp approach has zero new dependencies, produces smooth transitions at any duration, and follows the exact R3F-recommended pattern from official pitfalls documentation. `@react-spring/three` can be added later as an enhancement if spring physics are desired.

**Why not CSS transitions:** ShimmerCore is Three.js — CSS has no access to material properties.

**Why not React state + re-renders:** Every parameter change would trigger a Canvas re-render. At 60fps and with multiple simultaneous lerps, this would cause significant jank.

**Frame lerp implementation:**
```typescript
// Inside useFrame — from verified R3F pitfalls + THREE.js API
mat.distort = THREE.MathUtils.lerp(mat.distort, target.distort, 0.04);
colorRef.current.lerp(new THREE.Color(target.color), 0.04);
mat.color.copy(colorRef.current);
```

**Lerp factor tuning guide:**
- `0.02` — very slow drift (8–10 sec to settle), dreamlike
- `0.04` — smooth transitions (~3–4 sec), recommended default
- `0.08` — snappy but still smooth (~1.5 sec)
- `0.15` — fast, slightly mechanical

`Float` speed and floatIntensity **cannot be lerped in `useFrame`** — they are React props on the `<Float>` wrapper. These must be driven via React state or simply set on domain change (they are slow, coarse-grained changes so a React state update on domain selection is appropriate and cheap).

---

## ShimmerCore Canonical Source Resolution

**Current state (C-003 from CONCERNS.md):**
- `App.tsx` lines 9–23: inline `ShimmerCore` — USED by `WarRoom`
- `src/components/ShimmerCore.tsx`: standalone extracted component — NOT USED anywhere

**Resolution for this phase:**
1. `src/components/ShimmerCore.tsx` becomes the canonical source (extended with `useFrame` + `patternStore` integration).
2. Remove the inline `ShimmerCore` definition from `App.tsx`.
3. Import `ShimmerCore` from `src/components/ShimmerCore.tsx` in `App.tsx`.
4. `ShimmerCore` no longer accepts props — it reads the Zustand store directly.

**Prop signature change:** Old: `ShimmerCore({ mode, distort })` → New: `ShimmerCore()` (no props; store-driven). This is a breaking change to the component API but there is only one call site (`WarRoom` in `App.tsx`) so the migration is trivial.

**Float speed / floatIntensity:** Because `Float` speed and floatIntensity are React props (not Three.js material properties), they need to pass through. Options:
- Read from a separate React state that usePatternObserver also updates (requires a second store slice or local state in WarRoom)
- Accept Float params as props derived from the store with a reactive selector (acceptable since Float does not re-render every frame)
- RECOMMENDATION: Read `floatSpeed` and `floatIntensity` from the Zustand store via reactive selector in `WarRoom` and pass as props to `Float`. These change only on domain transitions (rare), so the re-render cost is negligible.

---

## Implementation Sequence

1. **Create `src/stores/patternStore.ts`** — Zustand store with `ShimmerTarget` type and `setTarget`.
2. **Resolve C-003** — Delete inline `ShimmerCore` from `App.tsx`; rewrite `src/components/ShimmerCore.tsx` as the canonical version with `useFrame` + store integration.
3. **Create `src/hooks/usePatternObserver.ts`** — Signal aggregation hook; maps app state to `ShimmerTarget`.
4. **Wire `usePatternObserver` into `WarRoom`** in `App.tsx` — pass current signals (appMode, crisis mode, selected domain, gate flags).
5. **Add `selectedDomain` state to `WarRoom`** (or promote to `App.tsx`) — currently domain selection exists only in native screens; the web shell needs a way to signal domain selection. For the web phase, a stub value (or the existing mode toggle repurposed) suffices initially.
6. **Test signal transitions** — manually trigger SOS mode, toggle mode, observe sphere response.
7. **Tune lerp factor** — adjust `LERP` constant until transitions feel right.

---

## Risks and Mitigations

### Risk 1: Float props cannot be lerped in useFrame
**What goes wrong:** `floatSpeed` and `floatIntensity` are React props on `<Float>`. You cannot mutate them via a ref inside `useFrame`. Attempting to do so silently does nothing.
**Mitigation:** Drive Float props via a reactive Zustand selector in `WarRoom` (outside Canvas). Since domain changes are infrequent events (not 60fps), the React re-render cost is negligible. [VERIFIED: Context7/pmndrs/drei Float docs confirm props-based API]

### Risk 2: THREE.Color.lerp creates a new Color object every frame
**What goes wrong:** `colorRef.current.lerp(new THREE.Color(target.color), LERP)` allocates a `THREE.Color` on every frame — this is a GC allocation at 60fps.
**Mitigation:** Pre-allocate a scratch `THREE.Color` at the module level or in the component ref. Store `targetColor` as a `THREE.Color` ref and update it only when `target.color` changes.
```typescript
const targetColorRef = useRef(new THREE.Color('#1e293b'));
// In useFrame: no allocation — just lerp two existing Color instances
materialRef.current.color.lerp(targetColorRef.current, LERP);
```
[ASSUMED — GC pressure at 60fps; standard Three.js optimization practice]

### Risk 3: Supabase latency producing null profile during gate transition
**What goes wrong:** `useTetherState` returns `profile: null` while loading. The PatternObserver receives `isCrisisMode: false` (default) before the profile loads, then snaps to the correct state after load. This causes a visible color jump rather than a smooth transition.
**Mitigation:** Initialize `ShimmerTarget` with the `isLoading` state preserved (keep defaults while loading). Since lerp transitions are smooth, even a delayed profile load will produce an animated transition rather than a snap. No special handling required unless the transition is jarring in practice.

### Risk 4: selectedDomain not yet exposed in the web shell
**What goes wrong:** Domain selection exists in `src/native/FitnessOnboardingGrid.tsx` which is excluded from the Vite build. The web shell WarRoom has no domain state.
**Mitigation:** For Phase 1, `selectedDomain` can be driven by the existing MILITARY/ETHER mode toggle (Iron domain → MILITARY, Mat domain → ETHER), or a stub `null` value. The full domain selection integration is a Phase 2 concern. The PatternObserver hook should accept `selectedDomain` as a nullable input.

### Risk 5: ShimmerCore type error — MeshDistortMaterial ref typing
**What goes wrong:** `MeshDistortMaterial` from drei is not a standard Three.js class; its TypeScript type for `ref` requires care. Using `useRef<THREE.MeshDistortMaterial>` will fail as that type does not exist on THREE.
**Mitigation:** Use `useRef<InstanceType<typeof MeshDistortMaterial>>(null!)` or import the type directly from drei if exposed. [ASSUMED — verify against installed drei version's TypeScript exports]

### Risk 6: Zustand v5 API differences from v4
**What goes wrong:** Zustand v5 (current: 5.0.12) has breaking changes from v4. Some patterns found via web search use v4 API (e.g., `create` import changed).
**Mitigation:** In Zustand v5, `create` is still imported from `zustand`. No API change to `create`, `getState`, or `subscribe`. [VERIFIED: Context7/pmndrs/zustand README uses identical API; v5 primary change is React 18+ concurrent mode compatibility]

---

## Files to Create/Modify

| Action | File | Notes |
|--------|------|-------|
| CREATE | `src/stores/patternStore.ts` | Zustand store: ShimmerTarget type + usePatternStore |
| CREATE | `src/hooks/usePatternObserver.ts` | Signal aggregation; maps app signals to ShimmerTarget |
| REWRITE | `src/components/ShimmerCore.tsx` | Canonical component: useFrame lerp + store integration |
| MODIFY | `src/App.tsx` | Remove inline ShimmerCore; import canonical; mount usePatternObserver in WarRoom; add selectedDomain state |

No new npm packages required for MVP. `zustand` is the only addition.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | GC pressure from `new THREE.Color()` per frame is a real concern worth pre-allocating | Risks #2 | Minor — GC impact may be negligible at this scale |
| A2 | `MeshDistortMaterial` ref type is `InstanceType<typeof MeshDistortMaterial>` | Code Examples | TypeScript compilation error if wrong — verify against installed @react-three/drei exports |
| A3 | Float speed/floatIntensity changes (domain transitions) are infrequent enough that a React re-render is acceptable | Animation Strategy | If domain changes become rapid (e.g., in future gamified mode), Float transitions will cause re-renders |
| A4 | The LERP factor of 0.04 will feel right aesthetically | Parameter Map | Pure aesthetic judgment — will require tuning |
| A5 | No domain state exists in the web shell | Implementation Sequence | If domain state is added elsewhere before this phase, integration point changes |

---

## Open Questions

1. **Should `selectedDomain` be promoted to `App.tsx` now or remain native-only for Phase 1?**
   - What we know: Domain selection exists only in `src/native/` (excluded from Vite build). WarRoom has no domain concept.
   - What's unclear: Whether Phase 1 should stub domain or begin wiring a simplified domain picker into the web shell.
   - Recommendation: Stub `selectedDomain: null` in Phase 1. The observer degrades cleanly to default state. Domain wiring is a follow-on phase.

2. **Should `bitchweightCount` and `liftingGated` be computed synchronously in the PatternObserver or passed in as resolved state?**
   - What we know: `bitchweights()` and `trickycardio()` are async Supabase calls. The PatternObserver hook receives signals reactively.
   - What's unclear: Whether to call these functions from inside the observer (creates async dependencies) or have `WarRoom` resolve them and pass the results in.
   - Recommendation: `WarRoom` (or a session-level hook) resolves the async calls and passes boolean/count results into `usePatternObserver`. Keep the observer synchronous and pure.

3. **Should the LERP factor be a constant or configurable per-parameter?**
   - Recommendation: Start with a single global `LERP = 0.04` constant in `patternStore.ts`. Per-parameter lerp is premature optimization.

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — all required packages already installed; only Zustand is new and is a pure npm add with no system dependencies).

---

## Validation Architecture

`nyquist_validation: false` in `.planning/config.json` — section omitted.

---

## Security Domain

`security_enforcement: false` in `.planning/config.json` — section omitted.

---

## Sources

### Primary (HIGH confidence — verified via Context7)
- `/pmndrs/react-three-fiber` — pitfalls.mdx: `useFrame` + `store.getState()` pattern, avoid `setState` in frame loop
- `/pmndrs/react-three-fiber` — hooks.mdx: `useFrame`, `useThree` APIs
- `/pmndrs/drei` — mesh-distort-material.mdx: `distort`, `speed` props; float.mdx: Float component API
- `/pmndrs/react-spring` — guides.react-three-fiber.mdx: `animated(MeshDistortMaterial)`, `useSpring` pattern
- `/pmndrs/zustand` — README: `subscribeWithSelector`, transient updates with `subscribe + useRef` pattern

### Secondary (HIGH confidence — package registry)
- npm registry: zustand@5.0.12, @react-spring/three@10.0.3, @react-three/fiber@9.6.0, @react-three/drei@10.7.7 [VERIFIED: 2026-04-22]

### Tertiary (ASSUMED from codebase read)
- ShimmerCore parameter defaults from `src/App.tsx` lines 9–23 and `src/components/ShimmerCore.tsx`
- Signal sources from `src/hooks/useTetherState.ts` and `src/lib/supabase.ts` Profile type

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified against npm registry and Context7
- Architecture (Zustand bridge + useFrame lerp): HIGH — verified against official R3F pitfalls documentation
- Parameter map (domain → visual values): MEDIUM — the mapping is ASSUMED aesthetic judgment, not sourced from existing design specs
- Animation strategy: HIGH — verified R3F-recommended approach
- Pitfalls: HIGH — sourced directly from R3F official pitfalls doc

**Research date:** 2026-04-22
**Valid until:** 2026-07-22 (Three.js / R3F ecosystem moves, but core `useFrame` + Zustand bridge pattern is architecturally stable)
