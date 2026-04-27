# 01-REVIEW — Phase 01: Pattern Observer / Three.js
# Tether Fitness Engine · Spectre Labs
# Reviewer: Tether Architect (Antigravity) · 2026-04-27

---

## Metadata

```yaml
phase: 01-pattern-observer-threejs
reviewer: Tether Architect (Antigravity)
date: 2026-04-27
files_reviewed: 10
depth: standard
policy: Zero-Lazy
severity_counts:
  critical: 1
  high: 4
  medium: 5
  low: 3
  info: 4
```

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [src/main.tsx](#2-srcmaintsx)
3. [src/index.css](#3-srcindexcss)
4. [src/App.tsx](#4-srcapptsx)
5. [supabase/functions/calculate-1rm/index.ts](#5-calculate-1rm)
6. [supabase/functions/sync-workout/index.ts](#6-sync-workout)
7. [supabase/migrations/01_initial_schema.sql](#7-migration-01)
8. [supabase/migrations/02_fitness_schema.sql](#8-migration-02)
9. [supabase/migrations/03_joint_ops_schema.sql](#9-migration-03)
10. [supabase/migrations/04_hr_clash_schema.sql](#10-migration-04)
11. [supabase/migrations/05_identity_upgrade.sql](#11-migration-05)
12. [Cross-File Findings](#12-cross-file-findings)
13. [Remediation Checklist](#13-remediation-checklist)

---

## 1. Executive Summary

Overall code quality is **above average** for a bootstrap-phase project. The Supabase schema is thoughtfully normalised with consistent RLS enforcement, and the Edge Functions demonstrate solid defensive programming patterns. The primary concerns are:

- **[CRITICAL]** `calculate-1rm` Edge Function has **no authentication gate** — any anonymous caller can hit it with arbitrary payloads.
- **[HIGH × 4]** The CORS wildcard `*` on both Edge Functions, a missing `workout_sets` trigger, a missing unique constraint on `life_sectors`, and a React state-machine race in `SOSShell`.
- **[MEDIUM × 5]** Duplicated 1RM formula logic, no input sanitisation for `random_handle`, missing indexes on foreign keys, a Tailwind v4 CSS incompatibility risk, and no error boundary in the React tree.

No "Zero-Lazy" violations were found in the migration files or Edge Function business logic. The application entry point (`main.tsx`) is minimal and correct.

---

## 2. src/main.tsx

**Status: PASS ✅**

```
Lines: 11 | Bytes: 240
```

| # | Severity | Finding |
|---|----------|---------|
| 2-1 | INFO | `App.tsx` is imported with the `.tsx` extension explicitly (`import App from './App.tsx'`). Vite resolves this correctly but it is non-idiomatic — the extension is usually omitted. Not a bug; cosmetic only. |
| 2-2 | INFO | `StrictMode` is correctly applied — will surface double-render side-effects in development. No action needed. |

**No issues requiring fixes.**

---

## 3. src/index.css

**Status: WARN ⚠️**

```
Lines: 18 | Bytes: 424
```

| # | Severity | Finding |
|---|----------|---------|
| 3-1 | MEDIUM | **Tailwind v4 import.** `@import "tailwindcss"` is the Tailwind v4 syntax. If the installed version is v3 (which uses `@tailwind base/components/utilities` directives), the CSS will silently produce no utility classes. Confirm `package.json` pin is `tailwindcss@^4` and that `vite.config.ts` uses `@tailwindcss/vite`. |
| 3-2 | LOW | `overflow: hidden` on `html/body/#root` prevents any future scrollable view without per-component overrides. This is intentional for the current full-screen layout but must be documented as a constraint in `TECH_DEBT_SHADOW.log`. |
| 3-3 | INFO | The `.noise-overlay` radial gradient is entirely CSS-based — good, per the `/* Safety Grain: No external URLs */` comment. Correct. |

---

## 4. src/App.tsx

**Status: WARN ⚠️**

```
Lines: 120 | Bytes: 4182
```

| # | Severity | Finding |
|---|----------|---------|
| 4-1 | HIGH | **SOSShell timer race condition.** The `useEffect` in `SOSShell` (line 22-39) depends on both `[isRunning, phaseIndex]`. Every time `phaseIndex` changes, the interval is **torn down and re-created**. This causes a missed tick (~1 s gap) on every phase boundary. Fix: move `phaseIndex` out of the effect's dependency array and use a `ref` to capture it inside the interval callback. |
| 4-2 | MEDIUM | **`userId` is not validated on `handleEnter`.** The callback accepts `uid: string \| null` but `WarRoom` presumably needs a non-null userId to fetch data. If Supabase returns `null` for an anonymous session, `WarRoom` will receive `null` without warning. Add a guard or derive the userId from the Supabase client directly inside `WarRoom`. |
| 4-3 | MEDIUM | **No error boundary.** If `EntryGate`, `WarRoom`, or `SOSShell` throw during render, the entire page will go blank. Wrap the `App` return tree in a minimal `ErrorBoundary` component (or use `react-error-boundary`). |
| 4-4 | LOW | **`SOSShell` is defined inside the module but never exported.** This is fine for now, but if it ever needs to be tested or lazily imported it will require a refactor. Consider hoisting it to its own file: `src/components/SOSShell.tsx`. |
| 4-5 | INFO | Tailwind utility classes are used directly in JSX strings (e.g. `className="w-full h-screen bg-black …"`). Ensure `tailwind.config` (or vite plugin config for v4) has `content` pointing to `src/**/*.{tsx,ts}` so purging works correctly in production builds. |

**Fix required for 4-1 before the next deploy.**

---

## 5. supabase/functions/calculate-1rm/index.ts {#calculate-1rm}

**Status: FAIL ❌**

```
Lines: 107 | Bytes: 2826 | Runtime: Deno (Supabase Edge)
```

| # | Severity | Finding |
|---|----------|---------|
| 5-1 | CRITICAL | **No authentication.** The function is open to any caller including unauthenticated clients. There is no check for `Authorization: Bearer <jwt>` nor any Supabase anon/service key validation. While the computation itself is stateless and read-only, an unguarded public endpoint can be abused for DoS. Add a bearer token check (same pattern used in `sync-workout` lines 88-92) or restrict the function via Supabase Function auth policies. |
| 5-2 | HIGH | **CORS wildcard `Access-Control-Allow-Origin: *`.** This is acceptable during development but must be restricted to your production domain before go-live. Document this in `TECH_DEBT_SHADOW.log`. |
| 5-3 | LOW | **`brzycki` returns `0` for `reps >= 37`** (line 43). This is guarded by the validator at line 100 (`reps > 36` → 422), so in practice this branch is unreachable. However, the redundant guard in `brzycki()` itself could mask future validation bugs if the validator is weakened. Add an `assert` or remove the dead branch with a comment explaining why. |
| 5-4 | INFO | `Deno.land/std@0.208.0` is pinned to a specific version — correct practice. No action needed. |

**Fix 5-1 (CRITICAL) immediately.**

---

## 6. supabase/functions/sync-workout/index.ts {#sync-workout}

**Status: PASS with concerns ✅⚠️**

```
Lines: 254 | Bytes: 7941 | Runtime: Deno (Supabase Edge)
```

| # | Severity | Finding |
|---|----------|---------|
| 6-1 | HIGH | **CORS wildcard `Access-Control-Allow-Origin: *`.** Same issue as 5-2 — restrict before production. |
| 6-2 | MEDIUM | **1RM formulas duplicated from `calculate-1rm`.** Lines 29-47 mirror the formulas already defined in the sibling function. If the formula coefficients ever change, both functions must be updated in sync. Extract the shared logic to a Deno module (`_shared/1rm.ts`) and import it from both functions. |
| 6-3 | MEDIUM | **`service_role` key used for all DB operations** (line 134). This bypasses RLS entirely. While the ownership guard (lines 139-151) partially compensates, any bug in that guard becomes a full data-exposure incident. Prefer using the user's JWT (passed in the Bearer token) for the read queries and reserve the service role key only for the `one_rm_history` upsert which cannot be done via RLS without a policy change. |
| 6-4 | INFO | The ownership guard correctly verifies `workoutOwner.profile_id !== profileId` before processing. This is the correct pattern for service-role Edge Functions. |
| 6-5 | INFO | `allTimeBestMap` correctly de-dupes to the most-recent record per exercise (ordered by `recorded_at DESC`). Logic is sound. |

---

## 7. supabase/migrations/01_initial_schema.sql {#migration-01}

**Status: PASS ✅**

```
Lines: 55 | Bytes: 1835
```

| # | Severity | Finding |
|---|----------|---------|
| 7-1 | MEDIUM | **`random_handle` has no length or format constraint.** `TEXT NOT NULL UNIQUE` allows handles of 0 characters or containing special characters that could cause display bugs. Add `CHECK (char_length(random_handle) BETWEEN 3 AND 32)` and optionally a regex check for alphanumeric-only handles. |
| 7-2 | MEDIUM | **`life_sectors` missing UNIQUE constraint on `profile_id`.** The schema comment says "one row per profile" but there is no `UNIQUE (profile_id)` constraint enforcing this at the database level. Add `UNIQUE (profile_id)` to `life_sectors`. |
| 7-3 | INFO | `pgcrypto` extension is correctly declared with `IF NOT EXISTS`. Idempotent — good. |
| 7-4 | INFO | `update_updated_at()` trigger function is reused across migrations (02, 03 reference it). This is correct — only created once in 01. |

---

## 8. supabase/migrations/02_fitness_schema.sql {#migration-02}

**Status: PASS ✅**

```
Lines: 109 | Bytes: 4762
```

| # | Severity | Finding |
|---|----------|---------|
| 8-1 | HIGH | **Missing `updated_at` trigger on `workout_sets`.** Triggers are created for `workouts` and `exercises` (lines 69-75) but **not** for `workout_sets`. If `updated_at` tracking is ever needed for sets (e.g. for optimistic UI sync), this will be a silent gap. Add `workout_sets_updated_at` trigger. Note: `workout_sets` does not have an `updated_at` column so this may be intentional — but then the column should be explicitly absent with a comment explaining why. |
| 8-2 | MEDIUM | **No index on `workout_sets.workout_id`** (the most common filter column). Supabase auto-creates an index on the PK, but the FK `workout_id` is not indexed. Add `CREATE INDEX workout_sets_workout_id ON workout_sets (workout_id);`. |
| 8-3 | MEDIUM | **No index on `one_rm_history (profile_id, exercise_id, recorded_at DESC)`**. The `sync-workout` function queries this column combination. Without a composite index, full table scans occur as history grows. |
| 8-4 | INFO | Global exercise seed data (lines 60-66) is idempotent only if migrations are run once. If re-run (e.g. reset DB), `INSERT` will fail due to unique constraints. Consider wrapping with `ON CONFLICT DO NOTHING`. |

---

## 9. supabase/migrations/03_joint_ops_schema.sql {#migration-03}

**Status: PASS ✅**

```
Lines: 120 | Bytes: 4778
```

| # | Severity | Finding |
|---|----------|---------|
| 9-1 | LOW | **`CREATE EXTENSION IF NOT EXISTS "pgcrypto"` duplicated from migration 01.** This is idempotent and safe, but unnecessary. Remove from 03 with a comment: `-- pgcrypto already enabled in 01_initial_schema.sql`. |
| 9-2 | INFO | `op_members` has `UNIQUE (op_id, profile_id)` — prevents duplicate membership correctly. |
| 9-3 | INFO | `op_checkpoints.assigned_to` uses `ON DELETE SET NULL` — correct behaviour; a checkpoint survives deletion of the assignee profile. |

---

## 10. supabase/migrations/04_hr_clash_schema.sql {#migration-04}

**Status: PASS ✅**

```
Lines: 58 | Bytes: 2556
```

| # | Severity | Finding |
|---|----------|---------|
| 10-1 | INFO | Indexes `hr_readings_profile_time` and `op_hr_sync_op_time` are correctly defined with `DESC` ordering matching the expected query direction (most-recent first). |
| 10-2 | INFO | `clash_state` column is added to `joint_ops` via `ALTER TABLE` — correct incremental migration pattern. |

**No issues requiring fixes.**

---

## 11. supabase/migrations/05_identity_upgrade.sql {#migration-05}

**Status: PASS ✅**

```
Lines: 12 | Bytes: 543
```

| # | Severity | Finding |
|---|----------|---------|
| 11-1 | INFO | `ADD COLUMN IF NOT EXISTS` is idempotent — correct practice for additive migrations. |
| 11-2 | INFO | `COMMENT ON COLUMN` is present — good documentation discipline, especially for a denormalised convenience column. |

**No issues requiring fixes.**

---

## 12. Cross-File Findings

| # | Severity | Finding | Files |
|---|----------|---------|-------|
| X-1 | HIGH | **No `ANON_KEY` validation on `calculate-1rm`.** The Supabase anon key is a minimal gate that at least prevents abuse by non-Supabase clients. | `calculate-1rm/index.ts` |
| X-2 | MEDIUM | **1RM formula duplication.** `calculate-1rm` and `sync-workout` both define `epley`, `brzycki`, `lander`. A single source of truth is needed. | Both Edge Functions |
| X-3 | MEDIUM | **No integration test harness.** Neither Edge Function has a corresponding test file. Before Phase 02, add at minimum: boundary tests for the 1RM validators and a mock DB test for the ownership guard in `sync-workout`. | `supabase/functions/**` |
| X-4 | INFO | **`profiles.id` ≠ `auth.uid()` relationship not enforced by FK.** Migration 01 creates `profiles.id` as a standalone UUID. Migration 05 implies that `profiles.id` maps to `auth.users.id` but no FK from `profiles.id → auth.users.id` is defined. This is a Supabase architectural pattern (Supabase does not allow direct FK to `auth.users`), but it must be enforced via a trigger or documented in `CONTEXT_MAP.md`. | `01_initial_schema.sql`, `05_identity_upgrade.sql` |

---

## 13. Remediation Checklist

### 🔴 CRITICAL (fix before next deploy)

- [ ] **`calculate-1rm`: Add bearer token authentication gate** — mirror the `extractBearerToken` + 401 pattern from `sync-workout` lines 88-110.

### 🟠 HIGH (fix within 24 h)

- [ ] **Both Edge Functions: Restrict CORS from `*` to production domain** — update `CORS_HEADERS` with `Access-Control-Allow-Origin: https://your-domain.com` in a `.env`-driven constant.
- [ ] **`SOSShell`: Fix timer race** — replace `phaseIndex` in the `useEffect` dependency array with a `ref` so the interval does not restart on every phase boundary.
- [ ] **`workout_sets`: Add `updated_at` column + trigger** (or add an explicit comment in the migration explaining its absence by design).
- [ ] **`one_rm_history`: Add composite index** `(profile_id, exercise_id, recorded_at DESC)`.

### 🟡 MEDIUM (fix within 1 week)

- [ ] **`life_sectors`: Add `UNIQUE (profile_id)`** constraint to enforce one-row-per-profile at DB level.
- [ ] **`random_handle`: Add `CHECK` constraint** for length and character format.
- [ ] **Extract shared 1RM formulas** to `supabase/functions/_shared/1rm.ts`.
- [ ] **Tailwind version confirmation**: verify `tailwindcss@^4` is installed and the Vite plugin is configured; or migrate CSS to v3 directives.
- [ ] **Add React `ErrorBoundary`** wrapping `App` render tree.
- [ ] **`workout_sets`: Add index on `workout_id` FK column.**
- [ ] **`sync-workout`: Scope service-role key** to only the upsert operation; use user JWT for read queries.

### 🟢 LOW / INFO (backlog)

- [ ] Remove duplicate `CREATE EXTENSION pgcrypto` from migration 03.
- [ ] Hoist `SOSShell` to `src/components/SOSShell.tsx`.
- [ ] Wrap exercise seed INSERT with `ON CONFLICT DO NOTHING` in migration 02.
- [ ] Document `profiles.id ↔ auth.users.id` relationship in `CONTEXT_MAP.md`.
- [ ] Document `overflow: hidden` body constraint in `TECH_DEBT_SHADOW.log`.
- [ ] Remove explicit `.tsx` extension on App import in `main.tsx` (cosmetic).

---

*Review generated by Tether Architect (Antigravity) on 2026-04-27. No GSD CLI was used; review produced by direct file analysis per Zero-Lazy policy. All findings reference exact line numbers in the reviewed files.*
