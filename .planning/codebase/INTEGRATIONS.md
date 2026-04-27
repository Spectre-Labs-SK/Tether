# Integrations

**Last Mapped:** 2026-04-27 (refresh after Phase 01 review fixes)

## External Services

### Supabase (Primary BaaS)
- **Role**: Auth, PostgreSQL database, Edge Functions
- **Client**: `@supabase/supabase-js` v2.104.0
- **Initialized in**: `src/lib/supabase.ts`
- **Auth mode**: Anonymous sign-in (`signInAnonymously()`) — zero-friction SOS flow; sessions persist via localStorage
- **Auth state management**: `supabase.auth.onAuthStateChange` + `supabase.auth.getSession()` in `EntryGate.tsx`

### Supabase Edge Functions
Two deployed functions under `supabase/functions/`:

| Function | Path | Purpose | Auth |
|---|---|---|---|
| calculate-1rm | `supabase/functions/calculate-1rm/` | Server-side 1RM calculation | Bearer JWT required (401 if missing) — added 2026-04-27 |
| sync-workout | `supabase/functions/sync-workout/` | Workout session persistence + PR detection | Bearer JWT required; service-role key for DB upsert |

**Auth pattern**: `extractBearerToken(req)` → checks `Authorization: Bearer <jwt>` header → 401 if absent. Standard Supabase anonymous session JWT is sufficient.

## Identity Upgrade (migration 05)

- Anonymous (Ghost) users can upgrade to a permanent identity via `supabase.auth.updateUser()`
- UUID is preserved on upgrade
- `profiles.is_registered` column denormalised for app-layer queries (TRUE after upgrade)
- Source of truth: `supabase.auth.users.is_anonymous`

## Auth

- **Provider**: Supabase Anonymous Auth
- **Flow**: Boot → check session → if none, `signInAnonymously()` → SIGNED_IN event → userId resolved
- **Kill switch**: `supabase.auth.signOut()` exposed as "Reset / Clear Session"
