# External Integrations

**Analysis Date:** 2026-04-22

## APIs & External Services

**Backend-as-a-Service:**
- Supabase - Primary backend; handles database, auth, Edge Functions, and Row Level Security
  - SDK/Client: `@supabase/supabase-js` ^2.104.0
  - Client init: `src/lib/supabase.ts` — `createClient(supabaseUrl, supabaseAnonKey)`
  - Auth env var: `VITE_SUPABASE_ANON_KEY`
  - URL env var: `VITE_SUPABASE_URL`

## Data Storage

**Databases:**
- PostgreSQL via Supabase (managed)
  - Connection: `VITE_SUPABASE_URL` (client) / `SUPABASE_URL` (Edge Functions)
  - Client: `@supabase/supabase-js` (no ORM — direct table queries via `.from().select()` pattern)
  - Schema managed via versioned migrations in `supabase/migrations/`

**Schema overview (4 migrations):**

| Migration | Tables |
|-----------|--------|
| `01_initial_schema.sql` | `profiles`, `life_sectors` |
| `02_fitness_schema.sql` | `workouts`, `exercises`, `workout_sets`, `one_rm_history` |
| `03_joint_ops_schema.sql` | `joint_ops`, `op_members`, `op_checkpoints` |
| `04_hr_clash_schema.sql` | `hr_readings`, `op_hr_sync`; adds `clash_state` column to `joint_ops` |

All tables use:
- UUID primary keys via `gen_random_uuid()` (pgcrypto extension)
- `updated_at` auto-update triggers (shared `update_updated_at()` function from migration 01)
- Row Level Security (RLS) enforced on all tables

**File Storage:**
- Not configured — local/device storage only for native layer (no Supabase Storage buckets detected)

**Caching:**
- None — no Redis, in-memory cache layer, or client-side persistence beyond React state

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built-in)
  - Implementation: Anonymous sign-in (`supabase.auth.signInAnonymously()`) in `src/components/EntryGate.tsx`
  - Session detection: `supabase.auth.getSession()` on mount
  - Auth state listener: `supabase.auth.onAuthStateChange()` subscription in `EntryGate.tsx`
  - Sign out: `supabase.auth.signOut()` exposed via kill-switch in `EntryGate.tsx`
  - Native layer: `supabase.auth.getUser()` used in `src/native/screens/PushDayOnboarding.tsx` (line 367) to retrieve current user before syncing workout

**Auth strategy:** Anonymous-first — users get a session immediately without registration. Profile row created in `profiles` table linked to `auth.uid()`. RLS policies use `auth.uid()` throughout.

**Kill switch:** `EntryGate.tsx` surfaces a sign-out call per the Feu Follet Charter requirement (anonymous session wipe + state reset).

## Supabase Edge Functions

**calculate-1rm:**
- Location: `supabase/functions/calculate-1rm/index.ts`
- Runtime: Deno (`deno.land/std@0.208.0`)
- Endpoint: `POST /functions/v1/calculate-1rm`
- Purpose: Stateless 1RM calculation (Epley, Brzycki, Lander formulas + consensus average)
- Auth: None required (no RLS bypass)
- Called from: Not yet invoked from client — logic mirrored inline in `sync-workout`

**sync-workout:**
- Location: `supabase/functions/sync-workout/index.ts`
- Runtime: Deno (`deno.land/std@0.208.0`); imports Supabase client via `https://esm.sh/@supabase/supabase-js@2`
- Endpoint: `POST /functions/v1/sync-workout`
- Purpose: After workout session, aggregates completed sets, computes consensus 1RM, upserts `one_rm_history` only when a new personal record is set
- Auth: Requires `Authorization: Bearer <token>` header; verifies workout ownership before any writes
- Service role: Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for aggregation reads (with explicit ownership guard)
- Called from: `src/native/screens/PushDayOnboarding.tsx` via `supabase.functions.invoke('sync-workout', { body, headers })` (line 430)

## Monitoring & Observability

**Error Tracking:**
- None — no Sentry, Datadog, or similar integration detected

**Logs:**
- Custom `agentLog` utility in `src/lib/agentLog.ts` — formats console output with `[Agent_Architect]` / `[Agent_Valkyrie]` prefixes for dev-time tracing
- Used in: `src/hooks/useTetherState.ts`, `src/hooks/useJointOps.ts`, `src/components/EntryGate.tsx`

## CI/CD & Deployment

**Hosting:**
- Not configured — no Vercel, Netlify, or deployment manifests detected

**CI Pipeline:**
- `.github/workflows/git-sentinel.yml` — Git Sentinel Audit (free tier); runs on GitHub Actions

## Environment Configuration

**Required env vars (web client):**
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key

**Required env vars (Edge Functions — set automatically by Supabase platform):**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Secrets location:**
- `.env.local` (not committed — not found in repo); no `.env.example` present

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected — `supabase.functions.invoke()` is a direct HTTP call from client, not a webhook

---

*Integration audit: 2026-04-22*
