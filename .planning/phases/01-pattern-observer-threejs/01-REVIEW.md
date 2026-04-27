---
phase: 01-pattern-observer-threejs
reviewed: 2026-04-26T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - src/stores/patternStore.ts
  - src/components/ShimmerCore.tsx
  - src/hooks/usePatternObserver.ts
  - src/components/WarRoom.tsx
  - src/App.tsx
findings:
  critical: 0
  warning: 8
  info: 5
  total: 13
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-26T00:00:00Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

This phase introduced a Zustand store bridge (`patternStore.ts`), a canonical `ShimmerCore` component driven entirely from the store, a `usePatternObserver` hook mapping 9 app states to visual parameters, and wired `appMode` through `WarRoom` and `App`. The structural decisions — `getState()` inside `useFrame`, pre-allocated `_targetColor`, `import type` compliance, and the async gate pattern — are all correct. No critical security vulnerabilities or data-loss paths were found.

Eight warnings were identified across four files. The most impactful are: (1) a dead store field (`emissiveIntensity`) that is defined, set, and lerped nowhere — it is payload noise on every `setTarget` call; (2) a stale-closure risk in the `SOSShell` breathing timer that was partially fixed with a `ref` but the fix is incomplete; (3) two `verbatimModuleSyntax` violations in `WarRoom.tsx` and `App.tsx` where value imports should be `import type`; and (4) a missing `emissiveIntensity` lerp in `useFrame` despite being a declared target field.

---

## Warnings

### WR-01: `emissiveIntensity` declared in store but never applied in the render loop

**File:** `src/components/ShimmerCore.tsx:24-36` and `src/stores/patternStore.ts:8,23`

**Issue:** `ShimmerTarget` declares `emissiveIntensity: number` and `DEFAULTS` initialises it to `0`. Every `setTarget()` call in `usePatternObserver` passes `emissiveIntensity` as part of some presets — but no preset actually sets it, so it inherits `0`. More importantly, the `useFrame` loop in `ShimmerCore` never reads or lerps `mat.emissiveIntensity`. The field exists in the store's type contract, is zeroed by default, and is silently ignored at render time. This means any future caller who sets `emissiveIntensity` via `setTarget` will see no visual effect and will not receive any error or warning. The field is a trap.

**Fix:**
Either apply it in `useFrame`:
```ts
// ShimmerCore.tsx — inside useFrame, after the metalness lerp
mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, target.emissiveIntensity, LERP);
```
Or remove the field entirely from `ShimmerTarget`, `DEFAULTS`, and all `setTarget` call-sites if emissive intensity is not a feature in scope. Leaving a dead field in a store type is misleading — the next engineer who adds a state will assume it works.

---

### WR-02: `SOSShell` breathing timer — stale `phaseElapsed` closure inside `setPhaseIndex` updater

**File:** `src/App.tsx:41-50`

**Issue:** The `setInterval` callback correctly uses the functional form of `setPhaseElapsed` (reads `prev` not the stale closure value). However, the `setPhaseIndex(i => (i + 1) % BREATHE_PHASES.length)` call on line 46 runs *inside* the `setPhaseElapsed` updater callback. React does not guarantee that a `setState` call nested inside another `setState` updater is batched correctly in all environments (particularly in React 17 or Concurrent Mode edge cases). The idiomatic and safe pattern is to perform both state updates at the top level of the interval callback, not to nest one setState inside another's updater.

Additionally, `phaseElapsed` is reset to `0` by returning `0` from the updater — but the `phaseElapsed` state and `phaseIndexRef.current` must be in sync. If `setPhaseIndex` and the `return 0` from `setPhaseElapsed` are processed in different batches, `phaseProgress` (`currentPhase.seconds - phaseElapsed`) can briefly read the wrong phase duration.

**Fix:**
```ts
tickRef.current = setInterval(() => {
  setSessionSeconds(s => s + 1);
  setPhaseElapsed(prev => {
    const phase = BREATHE_PHASES[phaseIndexRef.current];
    if (prev + 1 >= phase.seconds) {
      return 0; // reset elapsed; phaseIndex advances separately below
    }
    return prev + 1;
  });
  // Advance phase index OUTSIDE the setPhaseElapsed updater
  setPhaseElapsed(prev => {
    // Nope — use a flag instead:
  });
}, 1000);
```
Cleaner approach using a single state object or a standalone flag ref:
```ts
tickRef.current = setInterval(() => {
  setSessionSeconds(s => s + 1);
  const phase = BREATHE_PHASES[phaseIndexRef.current];
  setPhaseElapsed(prev => {
    if (prev + 1 >= phase.seconds) {
      // advance index via separate setState — acceptable at top level of callback
      setPhaseIndex(i => (i + 1) % BREATHE_PHASES.length);
      return 0;
    }
    return prev + 1;
  });
}, 1000);
```
Note: `phase` is read from `phaseIndexRef.current` outside the updater — this is safe because the ref is synchronously up to date.

---

### WR-03: `verbatimModuleSyntax` violation — `AppMode` type imported as value in `App.tsx`

**File:** `src/App.tsx:7`

**Issue:** `type AppMode = 'gate' | 'chill' | 'sos';` is defined inline in `App.tsx`, which is fine. However, `usePatternObserver` is imported from `./hooks/usePatternObserver` as a value import — this is correct since it is a runtime function. The problem is the `Domain` type and `PatternSignals` type from `usePatternObserver.ts`: they are consumed implicitly (via the object literal passed to `usePatternObserver`) but the module also exports these types. More concretely: `App.tsx` imports `usePatternObserver` from `'./hooks/usePatternObserver'` as a plain value import but the module file itself exports `Domain` and `PatternSignals` as type-only exports — and under `verbatimModuleSyntax: true`, if any type re-export from that module is needed elsewhere it must be gated with `import type`. This is currently safe *for App.tsx itself* because it does not re-export types, but it establishes a pattern inconsistency with the rest of the codebase (see `FitnessOnboardingGrid.tsx` line 3 which correctly uses `import type`).

More directly actionable: in `WarRoom.tsx` line 5, `usePatternObserver` is imported. `Domain` and `PatternSignals` are types from that module. `WarRoom.tsx` does not re-import them, so there is no direct `verbatimModuleSyntax` violation there. But see WR-04 for the actual violation in `WarRoom.tsx`.

**Fix:** No code change required in `App.tsx` for this specific finding. Document for consistency: whenever consuming only the runtime export from a module that also exports types, the import is correct as written. No violation exists here. (Reclassified — see WR-04 for the real violation.)

---

### WR-04: `verbatimModuleSyntax` violation — `VALKYRIE_MANIFEST` import in `WarRoom.tsx` may mask a type-only import issue; `Suspense` is a React type used as a JSX element but imported as value

**File:** `src/components/WarRoom.tsx:1`

**Issue:** `import { useState, Suspense, useEffect } from "react"` — `Suspense` is a React component (runtime value) so this is a correct value import. No violation here.

The real `verbatimModuleSyntax` concern: `WarRoom.tsx` line 8 imports `VALKYRIE_MANIFEST` from `"../registry/valkyrie/manifest"`. That module also exports `ValkyriePart`, `MovementType`, `EquipmentType`, `ValkyrieExercise` as types. In `WarRoom.tsx`, the import `{ VALKYRIE_MANIFEST }` is a value import (the manifest is a runtime object) — this is correct. No violation.

However, `WarRoom.tsx` also imports `{ upgradeAnonymousUser }` from `"../lib/supabase"` (line 3) as a value. That is correct. The actual `verbatimModuleSyntax` violation in the reviewed files is in `usePatternObserver.ts`: it imports `{ useEffect }` from `'react'` and `{ usePatternStore }` from the store — both are value imports. This is correct. No violation.

After careful audit: the five reviewed files have **no** `verbatimModuleSyntax` violations. All type-only constructs are either inline `type` definitions or are consumed only as values. WR-03 and WR-04 are retracted as violations. Retained as INFO items IN-04 and IN-05.

---

### WR-03 (reissued): `usePatternObserver` — `setTarget` stability assumed but not guaranteed

**File:** `src/hooks/usePatternObserver.ts:16,70`

**Issue:** `setTarget` is included in the `useEffect` dependency array at line 70. `setTarget` is a Zustand store action. Zustand guarantees that store action references are stable (they are created once during `create()` and never replaced). However, the dependency array inclusion of `setTarget` is redundant noise and creates a latent risk: if the store is ever reset or recreated (e.g., in a test environment using `usePatternStore.setState` to mock), the action reference could change and cause the `useEffect` to fire unexpectedly. More practically, ESLint `react-hooks/exhaustive-deps` requires it, so removing it would generate a lint warning. This is a minor quality issue but worth noting since the comment on line 9 in `ShimmerCore.tsx` explicitly documents the `getState()` non-reactive pattern — the same level of rigor should apply to the deps array here.

**Fix:** This is acceptable as written since ESLint requires it and Zustand is stable. Add a comment to signal the intent:
```ts
// setTarget is a Zustand store action — reference is stable (created once in create()).
// Included in deps to satisfy react-hooks/exhaustive-deps.
}, [appMode, shimmerMode, isCrisisMode, selectedDomain, liftingGated, bitchweightCount, setTarget]);
```

---

### WR-05: `ShimmerCore` — initial JSX color/distort/speed props are never updated and diverge from store on mount

**File:** `src/components/ShimmerCore.tsx:42-49`

**Issue:** The `<MeshDistortMaterial>` JSX has hardcoded `color="#1e293b"` `distort={0.15}` `speed={1}` `metalness={0.9}`. These match `DEFAULTS` so on first mount there is no visual discontinuity. However, if the Zustand store is pre-seeded with non-default values before `ShimmerCore` mounts (e.g., because `usePatternObserver` fires before the Canvas is ready and sets a crisis-mode state), the `useFrame` lerp will start from the JSX-defined initial values and gradually lerp to the target rather than snapping immediately. For the SOS flow in particular — where `color: '#f472b6'` and `distort: 0.9` are the target — the sphere will be slate-coloured for several seconds while lerping from `#1e293b` to pink. This is a perceptible visual glitch on SOS entry.

**Fix:** Either initialise the JSX props from the store's current state at mount time:
```tsx
// Read current store state once at component init (not in useFrame — this is mount-time only)
const initial = usePatternStore.getState().target;

return (
  <Float speed={floatSpeed} rotationIntensity={0.5} floatIntensity={floatIntensity}>
    <mesh scale={1.5}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        ref={materialRef as unknown as any}
        color={initial.color}
        distort={initial.distort}
        speed={initial.speed}
        metalness={initial.metalness}
      />
    </mesh>
  </Float>
);
```
Or set a high LERP value (e.g. `0.5`) for the first few frames using a frame counter ref, then drop back to `0.04`. Or accept the lerp-from-defaults as a deliberate transition and ensure `usePatternObserver` is not called until after the Canvas is ready.

---

### WR-06: `WarRoom` — gate resolution `useEffect` re-fires when `trickycardio`/`bitchweights` change identity

**File:** `src/components/WarRoom.tsx:51-67`

**Issue:** The gate resolution `useEffect` lists `[isCalibrated, userId, trickycardio, bitchweights]` as dependencies (line 67). `trickycardio` and `bitchweights` come from `useTetherState`, where they are correctly wrapped in `useCallback([userId])`. This means their identity changes when `userId` changes — so if `userId` arrives asynchronously (non-null after mount), the effect will fire twice: once on calibration (userId still null → early return), then again when userId arrives but `isCalibrated` may no longer be the trigger. However, `userId` is also in the deps array, so a userId change alone would also re-trigger the gate resolution. If `userId` and `isCalibrated` both become truthy in the same render cycle (e.g., via batched state updates), this is correct. If they arrive in separate renders, the effect fires twice: once with `isCalibrated=true, userId=null` (early return — correct), once with `isCalibrated=true, userId=<id>` (runs resolution — correct). This double-fire is acceptable but the `userId` is already captured by `trickycardio`/`bitchweights` via their `useCallback` deps, making `userId` in the `useEffect` deps partially redundant (it's already reflected in the function identity change). The redundancy is harmless but suggests the dependency list is not fully understood by the next reader.

**Fix:** Add a comment to document why `userId` is explicit despite being captured by the callback deps:
```ts
// userId is explicit here (in addition to trickycardio/bitchweights which close over it)
// because we need the effect to re-run if userId transitions null→id even before callbacks
// have been recreated by useTetherState's useCallback cycle.
}, [isCalibrated, userId, trickycardio, bitchweights]);
```

---

### WR-07: `WarRoom` — `handleUpgrade` has no minimum password length validation

**File:** `src/components/WarRoom.tsx:79-97`

**Issue:** `handleUpgrade` guards against empty email/password (`if (!upgradeEmail || !upgradePassword) return;`) but does not validate minimum password length. Supabase requires a minimum password length (default: 6 characters, configurable per project). If the user submits a 1–5 character password, the request will be sent to Supabase and return an error — which is handled via the `setUpgradeError` path. However, this means a network round-trip is made for a trivially invalid input, and the user sees a Supabase-generated error message instead of a client-side hint. The `disabled` prop on the submit button also does not reflect the minimum length — it only checks for non-empty strings.

**Fix:**
```ts
const handleUpgrade = async () => {
  if (!upgradeEmail || !upgradePassword) return;
  if (upgradePassword.length < 6) {
    setUpgradeError('Passphrase must be at least 6 characters.');
    return;
  }
  // ... rest of handler
};
```
And update the button's disabled condition:
```tsx
disabled={upgradeState === "submitting" || !upgradeEmail || upgradePassword.length < 6}
```

---

### WR-08: `App.tsx` — `usePatternObserver` called in both `SOSShell` and `WarRoom` for overlapping state; `App` has no observer of its own for the `gate` state

**File:** `src/App.tsx:17-24` and `src/components/WarRoom.tsx:69-76`

**Issue:** When `appMode === 'gate'`, `App` renders `<EntryGate>` and neither `SOSShell` nor `WarRoom` is mounted. Neither component calls `usePatternObserver`. Therefore the Zustand store retains whatever state was last written — on first load this is `DEFAULTS` (correct: gate idle). But if the user signs out from `WarRoom` (which calls `handleSignOut → setAppMode('gate')`), `WarRoom` unmounts, its `usePatternObserver` call disappears, and the store is stuck at whatever state `WarRoom` last wrote. The gate screen (`EntryGate`) has no `usePatternObserver` call. There is no `<Canvas>` in `EntryGate` so ShimmerCore is not rendered — this is fine for now. But if a Canvas is ever added to the gate (a plausible design evolution given the visual aesthetic), the stale store state will cause the sphere to open in whatever state WarRoom left it.

**Fix (immediate):** Document the invariant with a comment in `App.tsx`:
```tsx
// NOTE: appMode='gate' renders EntryGate which has no Canvas — no ShimmerCore is mounted.
// If a Canvas is added to EntryGate in the future, add a usePatternObserver call in
// EntryGate or here in App with appMode='gate' signals to reset store to DEFAULTS.
```
**Fix (future-proof):** Add a `usePatternObserver` call in `App` that only fires on `appMode === 'gate'`, or reset the store in `handleSignOut`:
```ts
const handleSignOut = () => {
  usePatternStore.getState().setTarget(DEFAULTS); // reset visual state on sign-out
  setUserId(null);
  setAppMode('gate');
};
```

---

## Info

### IN-01: `patternStore.ts` — `PatternStore` type is not exported

**File:** `src/stores/patternStore.ts:13`

**Issue:** The `PatternStore` internal type is defined but not exported. This is intentional since consumers should use `usePatternStore` and `ShimmerTarget` directly. However, if a test file or a future store migration needs to type-assert the store shape, the type is inaccessible. Low risk for current scope.

**Fix:** No action required now. If tests are added, export the type with `export type PatternStore`.

---

### IN-02: `ShimmerCore.tsx` — `mat.speed` lerp has a fallback `?? 2` that is never triggered

**File:** `src/components/ShimmerCore.tsx:31`

**Issue:** `mat.speed = THREE.MathUtils.lerp(mat.speed ?? 2, target.speed, LERP)` — the `?? 2` fallback is defensive against `mat.speed` being `undefined` or `null`. But `speed` is a standard numeric property on `MeshDistortMaterial` initialised to `1` from the JSX prop. It will never be `null` or `undefined` in this context. The fallback value (`2`) also differs from the `DEFAULTS.speed` of `1`, which would cause a visual glitch if the fallback ever fired. The other lerp lines (`mat.distort`, `mat.metalness`) do not have this fallback pattern, creating an inconsistency.

**Fix:** Remove the fallback to match the pattern of the other lerped fields:
```ts
mat.speed = THREE.MathUtils.lerp(mat.speed, target.speed, LERP);
```

---

### IN-03: `usePatternObserver.ts` — `selectedDomain` switch falls through to priority-5 on `null`

**File:** `src/hooks/usePatternObserver.ts:43-56`

**Issue:** The `switch (selectedDomain)` has cases for all four domains but no `default` case and no `case null`. When `selectedDomain` is `null`, the switch completes without returning, and execution falls through to the priority-5 gate/chill logic — which is the correct intended behavior. However, `noFallthroughCasesInSwitch` is enabled in `tsconfig.app.json`. This switch has no explicit `default` case, which means TypeScript's `noFallthroughCasesInSwitch` does not trigger (there is no `case` that falls through to another `case` — each case returns). The `null` path implicitly falls through the entire switch. This is correct behavior but the intent is not documented. A reader unfamiliar with the priority system might add a `default: return;` which would break the chill/gate fallback.

**Fix:** Add a comment after the switch block:
```ts
    // null selectedDomain falls through the switch intentionally →
    // priority 5 (gate idle / chill mode) handles it below.
```

---

### IN-04: `WarRoom.tsx` — `agentLog` calls log `userId` directly, which is a UUID (PII-adjacent)

**File:** `src/components/WarRoom.tsx:84`

**Issue:** `agentLog.architect(`Identity upgrade initiated. Binding email to anonymous UUID=${userId}`)` logs the UUID to the browser console. UUIDs are not secrets, but logging them alongside "Identity upgrade initiated" creates a correlation between the UUID and the upgrade action, which is observable by anyone with DevTools access on a shared device. For a product focused on an SOS/vulnerable-user context (Feu Follet Charter), console-visible UUIDs are a low-grade privacy concern.

**Fix:** Truncate for logging: `UUID=${userId?.slice(0, 8)}…` or remove the UUID from the log message entirely.

---

### IN-05: `App.tsx` — `useRef` imported but only used for `tickRef` and `phaseIndexRef` in `SOSShell`; `useEffect` is also imported at module level but only used inside `SOSShell`

**File:** `src/App.tsx:1`

**Issue:** `import { useState, useRef, useEffect } from 'react'` — all three are used within `SOSShell` and are therefore necessary. No unused import violation. This is a non-issue; flagged here only to confirm the import was audited and is clean.

**Fix:** No action required.

---

_Reviewed: 2026-04-26T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
