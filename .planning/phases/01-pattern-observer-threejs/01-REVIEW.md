---
phase: 01-pattern-observer-threejs
reviewed: 2026-04-28T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - src/stores/patternStore.ts
  - src/components/ShimmerCore.tsx
  - src/components/WarRoom.tsx
  - src/hooks/usePatternObserver.ts
  - src/App.tsx
  - src/components/fitness/PushDaySession.tsx
  - src/hooks/useJointOps.ts
  - src/hooks/useTetherState.ts
  - src/native/screens/MatSession.tsx
  - src/native/screens/PushDayOnboarding.tsx
  - src/native/screens/RoadSession.tsx
findings:
  critical: 3
  warning: 6
  info: 2
  total: 11
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-28
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Phase 01 delivered the Zustand/R3F bridge (`patternStore` → `ShimmerCore` → `usePatternObserver`), wired it into `WarRoom` and `App`, and cleaned up lint/build errors across six additional files. The core Three.js architecture is sound: `getState()`-inside-`useFrame`, the pre-allocated `_targetColor` scratch object, and the Float-prop reactive separation are all correctly implemented.

Three issues rise to BLOCKER severity across the expanded file scope. First, `useJointOps` constructs a PostgREST `.or()` filter string using raw SQL subquery syntax — PostgREST does not support this, so the membership branch of the query silently never fires, and the string interpolation of `userId` is an architectural injection vector. Second, `ShimmerCore`'s `useFrame` loop never applies `emissiveIntensity`, making every observer-emitted value for that field a no-op. Third, both `MatSession` and `RoadSession` include `timeRemaining` as a `useEffect` dependency on their interval effects, causing the interval to be torn down and recreated every second for the entire session duration.

---

## Critical Issues

### CR-01: PostgREST filter receives a raw SQL subquery — query silently broken and injection-pattern present

**File:** `src/hooks/useJointOps.ts:37`

**Issue:** The `.or()` call constructs its filter string via template literal interpolation embedding a raw SQL subquery:

```ts
.or(`owner_id.eq.${userId},id.in.(select op_id from op_members where profile_id = '${userId}')`)
```

PostgREST's `.or()` method accepts PostgREST filter syntax, not raw SQL. The `id.in.(select ...)` fragment is invalid PostgREST and will be rejected by the server (HTTP 400) or silently stripped, meaning the membership branch of the filter never fires. Users see only ops they own — not ops they are members of. The feature is broken at runtime.

Additionally, `userId` is interpolated without sanitization into the filter string. While Supabase UUIDs are constrained by auth, any code path that widens the `userId` type or passes a non-UUID value produces a SQL injection vector through PostgREST's query parsing layer.

**Fix:** Issue two separate queries and merge client-side:

```ts
const { data: ownedOps } = await supabase
  .from('joint_ops')
  .select('*')
  .eq('owner_id', userId)
  .order('created_at', { ascending: false });

const { data: memberRows } = await supabase
  .from('op_members')
  .select('op_id')
  .eq('profile_id', userId);

const memberOpIds = (memberRows ?? []).map(r => r.op_id);

const { data: memberOps } = memberOpIds.length > 0
  ? await supabase
      .from('joint_ops')
      .select('*')
      .in('id', memberOpIds)
      .order('created_at', { ascending: false })
  : { data: [] };

const seen = new Set<string>();
const allOps = [...(ownedOps ?? []), ...(memberOps ?? [])].filter(op => {
  if (seen.has(op.id)) return false;
  seen.add(op.id);
  return true;
});
setOps(allOps);
```

---

### CR-02: `emissiveIntensity` is set by the pattern observer but never applied in ShimmerCore's render loop

**File:** `src/components/ShimmerCore.tsx:24–36`

**Issue:** `ShimmerTarget` declares `emissiveIntensity: number`. `usePatternObserver` includes it in every `setTarget` call (SOS sets it via DEFAULTS merge; all other branches include it explicitly as `0` or pass it through). However, `ShimmerCore`'s `useFrame` block lerps `distort`, `speed`, `metalness`, and `color` — it never reads `target.emissiveIntensity` or writes `mat.emissiveIntensity`. Every emissive intensity value emitted by the observer is silently discarded. Any future pattern that uses emissive intensity (e.g., a crisis-mode pulsing glow) will appear to have no visual effect with no error or warning.

**Fix:** Add the lerp inside `useFrame`, after the `metalness` lerp:

```ts
mat.emissiveIntensity = THREE.MathUtils.lerp(
  mat.emissiveIntensity,
  target.emissiveIntensity,
  LERP,
);
```

`MeshDistortMaterial` extends `MeshStandardMaterial`, which has `emissiveIntensity`. The ref type `MeshPhysicalMaterial & { distort; speed }` already inherits this property — no type change required.

---

### CR-03: Timer effect recreated every second in MatSession and RoadSession — interval thrashing causes timing drift on low-end devices

**File:** `src/native/screens/MatSession.tsx:50–73`
**File:** `src/native/screens/RoadSession.tsx:69–94`

**Issue:** Both timer effects list `timeRemaining` in their dependency arrays. Since `timeRemaining` decrements every second, the effect fires every second: `clearInterval` is called and a new `setInterval` is registered once per tick. For a 30-minute yoga session this means ~1800 interval registrations. On low-end Android devices, each `clearInterval`/`setInterval` pair incurs a scheduler round-trip. The new interval starts fresh from the moment of registration — if JS is busy (GC, render), there can be a measurable gap between the end of one interval and the start of the next, causing seconds to be skipped under load. This is a correctness issue for a timing-sensitive UI, not just overhead.

**Fix:** Use refs to carry mutable values into the interval callback so the effect depends only on `isPaused`. This is the same ref-sync pattern already used in `App.tsx`'s `SOSShell`:

```ts
// MatSession.tsx — corrected timer
const currentPoseIndexRef = useRef(currentPoseIndex);
const posesRef = useRef(poses);

useEffect(() => { currentPoseIndexRef.current = currentPoseIndex; }, [currentPoseIndex]);
useEffect(() => { posesRef.current = poses; }, [poses]);

useEffect(() => {
  if (isPaused) return;

  const timer = setInterval(() => {
    setTimeRemaining((prev) => {
      if (prev <= 1) {
        const idx = currentPoseIndexRef.current;
        const localPoses = posesRef.current;
        if (idx < localPoses.length - 1) {
          Vibration.vibrate(100);
          setCurrentPoseIndex(idx + 1);
          return localPoses[idx + 1].durationSeconds;
        } else {
          Vibration.vibrate([200, 100, 200]);
          setIsPaused(true);
          navigation.goBack();
          return 0;
        }
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [isPaused, navigation]);
```

Apply the equivalent pattern to `RoadSession.tsx`.

---

## Warnings

### WR-01: `RoadSession` fallback path sets manifest but omits `setTimeRemaining` — timer frozen permanently at 00:00

**File:** `src/native/screens/RoadSession.tsx:56–63`

**Issue:** The `catch` block in `loadManifest` sets `manifest` to a fallback array but never calls `setTimeRemaining`. After the fallback executes, `timeRemaining` remains at `0`. The timer effect guards `if (isPaused || timeRemaining <= 0) return`, so the interval never starts even when the user presses START. The interval type label and timer circle render, but the countdown never moves.

**Fix:**

```ts
} catch (err) {
  console.error('[RoadSession] Failed to load manifest:', err);
  const fallback: Interval[] = [
    { type: 'warmup', durationMinutes: 5 },
    { type: 'work', durationMinutes: 30, intensity: 'medium' },
    { type: 'cooldown', durationMinutes: 5 },
  ];
  setManifest(fallback);
  setTimeRemaining(fallback[0].durationMinutes * 60); // missing in current code
}
```

---

### WR-02: Crisis-mode DB fix sets local state regardless of whether the update succeeded

**File:** `src/hooks/useTetherState.ts:100–107`

**Issue:** When a profile loads with `is_crisis_mode = true` and `onboarding_pending = false`, the hook issues a corrective DB update but does not check the result before patching local state:

```ts
await supabase
  .from('profiles')
  .update({ onboarding_pending: true })
  .eq('id', userId);
setProfile({ ...data, onboarding_pending: true }); // always runs
```

If the DB update fails (network error, RLS rejection), the local profile shows `onboarding_pending: true` and the onboarding overlay renders, but the DB still has `onboarding_pending: false`. The desync is transient (next session re-runs the fix), but the user is shown the onboarding overlay during a session where the DB did not confirm the state — which can produce duplicate onboarding triggers.

**Fix:** Chain `.select().single()` on the update and check the result:

```ts
const { data: patched, error: patchError } = await supabase
  .from('profiles')
  .update({ onboarding_pending: true })
  .eq('id', userId)
  .select()
  .single();

if (!patchError && patched) {
  setProfile(patched);
} else {
  setProfile(data); // use the as-fetched profile; state machine re-runs next session
  agentLog.architect(`WARNING: crisis_mode fix write failed: ${patchError?.message}`);
}
```

---

### WR-03: `PushDaySession` skip and pain-freeze inserts are fire-and-forget with no error handling

**File:** `src/components/fitness/PushDaySession.tsx:159–165`, `185–192`

**Issue:** Two Supabase inserts discard their results silently:

1. `skipExercise` (line 159): `supabase.from('exercise_skips').insert(...).then()` — the trailing `.then()` with no argument discards both the resolved value and any error. Skip tracking silently fails.
2. `handlePainAlert` (line 187): `supabase.from('muscle_group_freezes').insert(...).then()` — same pattern. A failed freeze insert means the lockdown appears in local state (user sees the lockdown alert) but is not persisted; the freeze is gone on next session.

The native counterpart (`PushDayOnboarding.tsx`) wraps both in `try/catch` with `console.error`. The web version (`PushDaySession.tsx`) does not.

**Fix:** Add error handling to match the native version:

```ts
// skipExercise — replace the fire-and-forget chain:
supabase.auth.getUser().then(({ data: { user } }) => {
  if (user) {
    supabase.from('exercise_skips')
      .insert({ profile_id: user.id, exercise_name: exerciseName, skipped_at: new Date().toISOString() })
      .then(({ error }) => {
        if (error) agentLog.architect(`Skip persist failed: ${error.message}`);
      });
  }
});
```

Or convert both callbacks to `async` and `await` the inserts inside a `try/catch`.

---

### WR-04: `PushDayOnboarding.syncWorkout` inserts an empty `setRows` array when all exercises are skipped — triggers a Supabase error that halts sync before the edge function runs

**File:** `src/native/screens/PushDayOnboarding.tsx:456–462`

**Issue:** `supabase.from('workout_sets').insert(setRows)` is called unconditionally even when `setRows` is empty (all exercises skipped or no sets completed). Inserting an empty array returns a Supabase error: `"body must be a JSON object or array with at least one element"`. The `setsError` check at line 458 surfaces this error to the user as "Sync Failed" — halting the sync flow before the `sync-workout` edge function is called. The workout row exists in the DB with no sets and no 1RM update.

Compare: `PushDaySession.tsx` (web version) guards this with `if (setRows.length > 0)` at line 230.

**Fix:**

```ts
if (setRows.length > 0) {
  const { error: setsError } = await supabase.from('workout_sets').insert(setRows);
  if (setsError) {
    Alert.alert('Sync Failed', setsError.message);
    setSyncing(false);
    return;
  }
}
```

---

### WR-05: `PushDayOnboarding.syncWorkout` calls `supabase.auth.getUser()` a second time unnecessarily — second call can fail independently

**File:** `src/native/screens/PushDayOnboarding.tsx:389`, `438`

**Issue:** `syncWorkout` calls `supabase.auth.getUser()` at line 389 (for the workout insert), verifies the user exists, then calls it again at line 438 (for skip tracking). Between the two calls, the session could expire. More practically: `user` from the first call is already in scope and is guaranteed non-null at that point — the second call is redundant network overhead.

**Fix:** Reuse the `user` object from the first call:

```ts
// At line 438, replace the second auth call:
if (user) {  // 'user' is in scope from the destructure at line 389
  const rows = skippedExercises.map(e => ({
    profile_id: user.id,
    exercise_id: e.exercise_id,
    exercise_name: e.name,
    skipped_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from('exercise_skips').insert(rows);
  if (error) console.error('[PushDay] Skipped exercises insert error:', error.message);
}
```

---

### WR-06: `MatSession` receives `activityId` param and uses it as an effect dep but always loads the same manifest regardless of value

**File:** `src/native/screens/MatSession.tsx:43–48`

**Issue:** `activityId` is a route param and the `useEffect` dependency, giving the appearance that different activity IDs produce different sessions. In practice, the effect body unconditionally loads `YOGA_FLOW_MANIFEST` for all values of `activityId`. The dependency creates a false contract: future callers that pass different activity IDs expecting different manifests will silently receive the same yoga flow with no error.

**Fix:** Remove `activityId` from the dependency array and document the stub clearly, or implement minimal branching:

```ts
useEffect(() => {
  // TODO: select manifest by activityId when multiple flows are available.
  // Currently all Mat domain activities use YOGA_FLOW_MANIFEST regardless of activityId.
  setPoses(YOGA_FLOW_MANIFEST);
  setTimeRemaining(YOGA_FLOW_MANIFEST[0]?.durationSeconds ?? 0);
}, []); // dep on activityId removed until multi-manifest routing is implemented
```

---

## Info

### IN-01: `calculate1RM` and its three sub-formulas are duplicated verbatim across two files

**File:** `src/components/fitness/PushDaySession.tsx:8–29`
**File:** `src/native/screens/PushDayOnboarding.tsx:33–60`

**Issue:** The `epley`, `brzycki`, `lander`, and `calculate1RM` functions are copy-pasted identically into both the web component and the native screen. Any future formula correction or precision change must be applied in two places and can drift. The duplication is a structural consequence of the web/native build split, but a shared path (`src/lib/oneRm.ts` or `src/shared/`) accessible to both tsconfig targets would eliminate the drift risk.

**Fix:** Extract to a shared utility file. If the native tsconfig exclusion prevents sharing `src/lib/`, create `src/shared/oneRm.ts` and include it explicitly in both configs.

---

### IN-02: `WarRoom` hardcodes `selectedDomain: null` with no in-file TODO — domain signal wiring point is invisible to future readers

**File:** `src/components/WarRoom.tsx:73–76`

**Issue:** `usePatternObserver` is called with `selectedDomain: null` unconditionally. The Phase 1 comment explaining this stub lives in `usePatternObserver.ts`, not in `WarRoom.tsx`. A developer looking at `WarRoom` in Phase 2 has no indication that `selectedDomain` needs to be wired from the fitness grid's domain selection. The Priority 4 domain switch in `usePatternObserver` is effectively dead from `WarRoom` with no visible marker.

**Fix:** Add a TODO at the call site:

```ts
usePatternObserver({
  appMode,
  shimmerMode,
  isCrisisMode: profile?.is_crisis_mode ?? false,
  selectedDomain: null, // TODO Phase 2: wire from FitnessOnboardingGrid domain selection
  liftingGated,
  bitchweightCount,
});
```

---

_Reviewed: 2026-04-28_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
