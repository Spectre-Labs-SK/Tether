# External Integrations

**Last mapped:** 2026-05-05

## Databases

**Supabase (PostgreSQL)**
- Provider: Supabase hosted Postgres
- Client: `@supabase/supabase-js` ^2.104.1
- Client file: `src/lib/supabase.ts` — single shared client exported as `supabase`
- Connection: `EXPO_PUBLIC_SUPABASE_URL` env var
- Auth key: `EXPO_PUBLIC_SUPABASE_ANON_KEY` env var
- Row-Level Security: enabled on all tables; users access only their own rows via `auth.uid() = profile_id`
- Migrations: `supabase/migrations/` (6 migrations applied in order)

**Schema (migration history):**

| Migration | Tables / Changes |
|-----------|-----------------|
| `01_initial_schema.sql` | `profiles`, `life_sectors`, `update_updated_at()` trigger, RLS |
| `02_fitness_schema.sql` | Fitness/workout tables (exercises, workouts, workout_sets, one_rm_history) |
| `03_joint_ops_schema.sql` | `joint_ops`, `op_members`, `op_checkpoints` |
| `04_hr_clash_schema.sql` | `hr_readings`, `op_hr_sync`, `clash_state` column on joint_ops |
| `05_identity_upgrade.sql` | `is_registered` column on profiles (anon→permanent upgrade tracking) |
| `06_tether_state_and_hub_sessions.sql` | `is_nightmare_active`, `theme_state` on profiles; `hub_sessions` table |

**Core DB types** (defined in `src/lib/supabase.ts`):
- `Profile` — user identity, crisis mode, onboarding state, theme
- `LifeSectors` — finance/health/work/groceries tarnish levels
- `JointOp` — collaborative mission (codename, shimmer_mode, status, clash_state)
- `OpMember` — op membership with role (commander/operative/observer)
- `OpCheckpoint` — op tasks with priority 1–4 and status
- `HRReading` — per-profile heart rate log (bpm, context)
- `OpHRSync` — shared HR snapshots within a joint op

## Auth

**Supabase Auth**
- Provider: Supabase built-in auth
- Client: `supabase.auth.*` methods via `src/lib/supabase.ts`
- Anonymous sessions: Created at app entry — `supabase.auth.signInAnonymously()` (invoked in `src/components/EntryGate.tsx` or `src/components/BunkerGate.tsx`)
- Anonymous flag: Read via `session.user as { is_anonymous?: boolean }` — property exists in JWT but absent from SDK types
- Upgrade path: `upgradeAnonymousUser(email, password)` in `src/lib/supabase.ts` — calls `supabase.auth.updateUser({ email, password })` to preserve UUID and all linked data. Never use signOut+signIn.
- Returning user sign-in: `signInWithEmailPassword(email, password)` in `src/lib/supabase.ts`
- Kill switch: `triggerKillSwitch` — fire-and-forget, clears local state immediately then signs out async (Ethics Charter requirement — do not await)
- `userId` threading: `EntryGate.onEnter(mode, userId)` → `App` state → `WarRoom` prop → `useTetherState(userId)`

## APIs & Services

**Supabase Edge Functions (Deno runtime)**

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `calculate-1rm` | `POST /functions/v1/calculate-1rm` | Computes 1-rep max from weight+reps using Epley/Brzycki/Lander consensus. Body: `{ weightKg, reps }`. Returns: `{ epley, brzycki, lander, consensus, method }`. Source: `supabase/functions/calculate-1rm/index.ts` |
| `sync-workout` | `POST /functions/v1/sync-workout` | After workout completion: calculates per-exercise 1RM, upserts `one_rm_history` only when session best exceeds all-time PR. Uses service role key (bypasses RLS). Body: `{ workoutId, profileId }`. Returns: `{ processed, newPRs, skipped }`. Source: `supabase/functions/sync-workout/index.ts` |

Both functions:
- Use Deno std `serve` from `https://deno.land/std@0.208.0/http/server.ts`
- Require `Authorization: Bearer <token>` header
- Return JSON with CORS headers (`Access-Control-Allow-Origin: *`)
- Handle `OPTIONS` preflight

**EAS (Expo Application Services)**
- Provider: Expo / EAS Build
- Project ID: `79507357-e5e4-4f48-97ea-ba01a6f4ac65` (in `app.json`)
- Purpose: Cloud Android/iOS build pipeline
- No SDK import — configured via `app.json` `extra.eas` and EAS CLI

## Environment Variables

| Variable | File | Used By | Purpose |
|----------|------|---------|---------|
| `VITE_SUPABASE_URL` | `.env.local` | Vite (web) | Supabase project URL — mapped to `EXPO_PUBLIC_SUPABASE_URL` via `vite.config.ts` define block |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` | Vite (web) | Supabase anon key — mapped to `EXPO_PUBLIC_SUPABASE_ANON_KEY` via `vite.config.ts` define block |
| `EXPO_PUBLIC_SUPABASE_URL` | `.env.local` | Metro/Expo (native) | Supabase project URL — resolved natively by Metro |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` | Metro/Expo (native) | Supabase anon key — resolved natively by Metro |
| `SUPABASE_URL` | Supabase edge function env | Edge functions | Injected automatically by Supabase runtime |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase edge function env | `sync-workout` only | Service role key for RLS bypass during 1RM aggregation |

**Fallback behavior:** `src/lib/supabase.ts` falls back to placeholder strings (`https://placeholder.supabase.co`, `placeholder-anon-key`) when env vars are absent, so `createClient` does not throw. Auth calls will fail gracefully via EntryGate error path.

**Note on dual-bundler env pattern:** Both bundlers resolve `EXPO_PUBLIC_SUPABASE_*` names. Vite injects them via the `define` block in `vite.config.ts`. Metro resolves `EXPO_PUBLIC_*` natively. `src/lib/supabase.ts` uses one env var pattern for both.

## Webhooks & Realtime

**Supabase Realtime**
- Available via `@supabase/supabase-js` client (realtime channels built into SDK)
- Not yet wired to any active channel subscriptions in current source — infrastructure is present via the client

**Outgoing webhooks:** None configured.

**Incoming webhooks:** None configured. Edge functions are invoked client-side via fetch (not via database triggers or webhooks).

## File Storage

**Local filesystem only** — no cloud file storage integration (no S3, no Supabase Storage buckets in use).

## Monitoring & Observability

**Error tracking:** None (no Sentry, DataDog, etc.)

**Logging:** Custom `agentLog` utility — `agentLog.architect()` for operational/debug logs, `agentLog.valkyrie()` for persona/narrative logs. No bare `console.log`.

**CI/CD:** No CI pipeline configured (no `.github/workflows/` active — directory exists but empty per anatomy.md).

---

*Integration audit: 2026-05-05*
