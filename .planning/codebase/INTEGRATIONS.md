# External Integrations

**Analysis Date:** 2026-05-05

## APIs & External Services

**Backend-as-a-Service:**
- Supabase — auth, PostgreSQL database, Edge Functions, Row Level Security
  - SDK/Client: `@supabase/supabase-js` ^2.104.1
  - Client initialized: `src/lib/supabase.ts`
  - Auth URL env var: `EXPO_PUBLIC_SUPABASE_URL`
  - Anon key env var: `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Data Storage

**Databases:**
- Supabase (PostgreSQL)
  - Connection: `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - Client: `@supabase/supabase-js` (no separate ORM; raw Supabase query builder)
  - Migrations: `supabase/migrations/` (6 migrations; up to `06_tether_state_and_hub_sessions.sql`)

**Tables (from migrations + `src/lib/supabase.ts` type registry):**
- `profiles` — user identity; `id`, `random_handle`, `is_crisis_mode`, `onboarding_pending`, `is_registered`, `is_nightmare_active`, `theme_state` (MILITARY/ETHER)
- `life_sectors` — per-profile sector scores (finance, health, work, groceries)
- `joint_ops` — collaborative mission layer; `shimmer_mode`, `status`, `clash_state`
- `op_members` — membership roles per joint op (commander/operative/observer)
- `op_checkpoints` — task items within a joint op; priority 1–4
- `hr_readings` — per-profile heart rate log with context tag
- `op_hr_sync` — shared operative HR snapshots within a joint op
- `hub_sessions` — Hub workout sessions; `up_time_seconds`, `postural_resets` (migration 06)

**Row Level Security:** Enabled on all tables. Policy pattern: `profile_id = auth.uid()` owner access.

**File Storage:**
- Not detected — no Supabase storage bucket references found

**Caching:**
- None

## Authentication & Identity

**Auth Provider:** Supabase Anonymous Auth
- Flow: Boot → check session → if none, `signInAnonymously()` → SIGNED_IN event → userId resolved
- Implemented in: `src/components/EntryGate.tsx` (auth state listener), `src/components/BunkerGate.tsx`
- `is_anonymous` detection: cast `session.user as { is_anonymous?: boolean }` — property exists in Supabase JWT but not in SDK types
- Anonymous → permanent upgrade: `supabase.auth.updateUser({ email, password })` (preserves UUID; do not use signOut+signIn)
- Kill switch: `supabase.auth.signOut()` — fire-and-forget via `triggerKillSwitch` in `useTetherState`; Ethics Charter requirement

**Auth helper functions in `src/lib/supabase.ts`:**
- `upgradeAnonymousUser(email, password)` — anonymous → permanent upgrade
- `signInWithEmailPassword(email, password)` — returning user sign-in on new device

## Supabase Edge Functions

Two deployed functions in `supabase/functions/`:

| Function | Path | Purpose | Auth |
|---|---|---|---|
| calculate-1rm | `supabase/functions/calculate-1rm/` | Server-side 1RM calculation | Bearer JWT required |
| sync-workout | `supabase/functions/sync-workout/` | Workout session persistence + PR detection | Bearer JWT; service-role key for DB upsert |

Auth pattern: `extractBearerToken(req)` checks `Authorization: Bearer <jwt>` header → 401 if absent. Anonymous session JWT is sufficient.

## Monitoring & Observability

**Error Tracking:** None detected

**Logs:**
- `agentLog.architect()` — operational/debug logs (project convention)
- `agentLog.valkyrie()` — persona/narrative logs (project convention)
- No bare `console.log` (enforced by convention)

## CI/CD & Deployment

**Hosting:** Expo Application Services (EAS)
- EAS project ID: `79507357-e5e4-4f48-97ea-ba01a6f4ac65`
- EAS CLI version requirement: >= 18.10.0 (`eas.json` `cli.version`)
- appVersionSource: `remote` (version managed by EAS, not `app.json`)

**Build profiles (`eas.json`):**
- `development` — APK, internal distribution, dev client enabled
- `preview` — APK, internal distribution; inlines `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` pointing to local Supabase at `http://10.0.0.24:54321`
- `production` — store distribution; `autoIncrement: true`; no inlined env vars (must be set via EAS secrets or dashboard)

**CI Pipeline:** No `.github/workflows/` CI configuration detected

## Environment Configuration

**Required environment variables:**

| Variable | Where used | Source |
|---|---|---|
| `VITE_SUPABASE_URL` | Web (Vite) — re-mapped to `EXPO_PUBLIC_SUPABASE_URL` in `vite.config.ts` | `.env.local` |
| `VITE_SUPABASE_ANON_KEY` | Web (Vite) — re-mapped to `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `vite.config.ts` | `.env.local` |
| `EXPO_PUBLIC_SUPABASE_URL` | Native (Metro) — read directly by `src/lib/supabase.ts` | `.env.local` / EAS env |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Native (Metro) — read directly by `src/lib/supabase.ts` | `.env.local` / EAS env |

**Secrets location:**
- Development: `.env.local` (gitignored)
- EAS preview: inlined in `eas.json` `build.preview.env` (local Supabase instance)
- EAS production: must be configured via EAS Secrets dashboard (not in repo)

**Fallback behavior:** `src/lib/supabase.ts` substitutes placeholder strings when env vars are absent, so `createClient` does not throw at module init. Auth calls fail gracefully; `EntryGate` handles this via its error path.

## Webhooks & Callbacks

**Incoming:** None detected outside Supabase auth state change listener

**Outgoing:** None detected

---

*Integration audit: 2026-05-05*
