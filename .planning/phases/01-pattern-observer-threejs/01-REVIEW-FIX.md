---
phase: 01-pattern-observer-threejs
fix_date: 2026-04-28T00:00:00Z
fix_scope: critical_warning
findings_in_scope: 9
fixed: 9
skipped: 0
iteration: 1
status: all_fixed
---

# Phase 01: Code Review Fix Report

**Fixed at:** 2026-04-28
**Source review:** .planning/phases/01-pattern-observer-threejs/01-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 9
- Fixed: 9
- Skipped: 0

---

## Fixed Issues

### CR-01: PostgREST subquery replaced with two-query merge in useJointOps

**Files modified:** `src/hooks/useJointOps.ts`
**Commit:** `4750564`
**Applied fix:** Replaced the single `.or()` call that embedded a raw SQL subquery (`id.in.(select op_id from op_members ...)`) with two separate queries: one for ops the user owns (`.eq('owner_id', userId)`) and one that first fetches `op_members` rows then uses `.in('id', memberOpIds)`. Results are merged client-side with a `Set<string>` for deduplication. Each query branch has its own error handling with early return and fall-through to owned-only on membership lookup failure. Eliminates the injection vector from string-interpolated userId.

---

### CR-02: emissiveIntensity lerp added to ShimmerCore useFrame loop

**Files modified:** `src/components/ShimmerCore.tsx`
**Commit:** `74d3f32`
**Applied fix:** Added `mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, target.emissiveIntensity, LERP)` after the `metalness` lerp inside `useFrame`. Every emissive value emitted by `usePatternObserver` was previously silently discarded because the render loop never read `target.emissiveIntensity`. No type change was needed — `MeshPhysicalMaterial` inherits `emissiveIntensity` from `MeshStandardMaterial`.

---

### CR-03: Timer effect interval thrashing fixed in MatSession and RoadSession

**Files modified:** `src/native/screens/MatSession.tsx`, `src/native/screens/RoadSession.tsx`
**Commit:** `73f7a51`
**Applied fix:** Extracted mutable values (`currentPoseIndex`/`poses` in MatSession; `currentIntervalIndex`/`manifest` in RoadSession) into refs (`currentPoseIndexRef`, `posesRef`, `currentIntervalIndexRef`, `manifestRef`). Added sync effects to keep refs current. Changed the timer `useEffect` dep array from `[isPaused, timeRemaining, currentPoseIndex, poses, navigation]` to `[isPaused, navigation]`. This prevents ~1800 clearInterval/setInterval pairs per yoga session that caused timing drift on low-end Android.

**Status:** fixed: requires human verification — logic change to ref-sync pattern; verify pose transitions and session completion behave correctly end-to-end.

---

### WR-01: RoadSession catch block now calls setTimeRemaining on fallback

**Files modified:** `src/native/screens/RoadSession.tsx`
**Commit:** `73f7a51`
**Applied fix:** Added `setTimeRemaining(fallback[0].durationMinutes * 60)` in the `catch` block of `loadManifest` after `setManifest(fallback)`. Also added explicit `Interval[]` type annotation to the fallback array. Previously `timeRemaining` stayed at `0` after a fallback, which combined with the `isPaused` guard meant the interval never started even after the user pressed START.

---

### WR-02: Crisis-mode DB update checks result before patching local profile state

**Files modified:** `src/hooks/useTetherState.ts`
**Commit:** `4ce1214`
**Applied fix:** Chained `.select().single()` on the `profiles.update({ onboarding_pending: true })` call and destructured `{ data: patched, error: patchError }`. If `!patchError && patched`, calls `setProfile(patched)` (DB-confirmed state). On failure, calls `setProfile(data)` (the as-fetched profile without the pending flag) and logs a warning via `agentLog.architect`. Prevents the desync where local state showed `onboarding_pending: true` but the DB still had `false`, which could trigger duplicate onboarding overlays.

---

### WR-03: Error handling added to fire-and-forget Supabase inserts in PushDaySession

**Files modified:** `src/components/fitness/PushDaySession.tsx`
**Commit:** `b92d812`
**Applied fix:** Added `({ error }) => { if (error) agentLog.architect(...) }` argument to the bare `.then()` callbacks in both `skipExercise` (exercise_skips insert) and `handlePainAlert` (muscle_group_freezes insert). Previously both returned void and discarded errors silently. Matches the error-handling style already in the native `PushDayOnboarding.tsx`.

---

### WR-04: Guard added around empty setRows insert in PushDayOnboarding.syncWorkout

**Files modified:** `src/native/screens/PushDayOnboarding.tsx`
**Commit:** `68295c7`
**Applied fix:** Wrapped `supabase.from('workout_sets').insert(setRows)` and its error check inside `if (setRows.length > 0) { ... }`. When all exercises are skipped or no sets are completed, `setRows` is empty. Inserting an empty array returned a Supabase error that surfaced as "Sync Failed" and halted sync before the `sync-workout` edge function ran. The web counterpart (`PushDaySession.tsx`) already had this guard.

---

### WR-05: Second supabase.auth.getUser() call removed from syncWorkout

**Files modified:** `src/native/screens/PushDayOnboarding.tsx`
**Commit:** `68295c7`
**Applied fix:** Removed the second `const { data: { user } } = await supabase.auth.getUser()` call inside the `skippedExercises.length > 0` block in `syncWorkout`. The `user` object from the first call (at function entry) is already in scope and guaranteed non-null at that point. The block now directly checks `if (user)` and reuses `user.id`. A comment documents the intent.

---

### WR-06: activityId removed from MatSession manifest-loading effect dep array

**Files modified:** `src/native/screens/MatSession.tsx`
**Commit:** `73f7a51`
**Applied fix:** Changed `}, [activityId])` to `}, [])` on the manifest-loading `useEffect`. Added a TODO comment explaining that all Mat domain activities currently use `YOGA_FLOW_MANIFEST` regardless of `activityId`, and that multi-manifest routing is deferred to Phase 2. Changed `durationSeconds || 0` to `?? 0` for nullish coalescing consistency.

---

## Skipped Issues

None — all 9 in-scope findings were fixed successfully.

---

_Fixed: 2026-04-28_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
