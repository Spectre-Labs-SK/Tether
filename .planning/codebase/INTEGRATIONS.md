# Integrations

**Last Mapped:** 2026-04-25

## External Services

### Supabase (Primary BaaS)
- **Role**: Auth, PostgreSQL database, Edge Functions
- **Client**: `@supabase/supabase-js` v2.104.0
- **Initialized in**: `src/lib/supabase.ts`
- **Auth mode**: Anonymous sign-in (`signInAnonymously()`) — zero-friction SOS flow; sessions persist via localStorage
- **Auth state management**: `supabase.auth.onAuthStateChange` + `supabase.auth.getSession()` in `EntryGate.tsx`

### Supabase Edge Functions
Two deployed functions under `supabase/functions/`:

| Function | Path | Purpose |
|---|---|---|
| calculate-1rm | `supabase/functions/calculate-1rm/` | Server-side 1RM calculation |
| sync-workout | `supabase/functions/sync-workout/` | Workout session persistence |

## Auth

- **Provider**: Supabase Anonymous Auth
- **Flow**: Boot → check session → if none, `signInAnonymously()` → SIGNED_IN event → userId resolved
- **Kill switch**: `supabase.auth.signOut()` exposed as "Reset / Clear Session"
