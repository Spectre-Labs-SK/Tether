# Integrations

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
| calculate-1rm | supabase/functions/calculate-1rm/ | Server-side 1RM calculation |
| sync-workout | supabase/functions/sync-workout/ | Workout session persistence |

## Auth

- **Provider**: Supabase Anonymous Auth
- **Flow**: Boot → check session → if none, `signInAnonymously()` → SIGNED_IN event → userId resolved
- **Kill switch**: `supabase.auth.signOut()` exposed as "Reset / Clear Session" in EntryGate (Feu Follet Charter compliance, labeled B-000)
- **No OAuth, no email/password auth** configured yet

## Database Tables

Managed via SQL migrations in `supabase/migrations/`:

| Table | Migration | Purpose |
|---|---|---|
| profiles | 01 | User profiles with random handle + crisis_mode flag |
| life_sectors | 01 | Finance/health/work/groceries sector scores |
| workouts | 02 | Workout session records |
| exercises | 02 | Exercise definitions |
| workout_sets | 02 | Individual set logs (weight, reps) |
| one_rm_history | 02 | 1RM progression tracking |
| joint_ops | 03 | Collaborative mission layer |
| op_members | 03 | Op membership (commander/operative/observer) |
| op_checkpoints | 03 | Op task list with priority/status |
| hr_readings | 04 | Per-profile heart rate log |
| op_hr_sync | 04 | Shared operative HR snapshots within a joint op |

## Environment Variables

| Variable | Used In | Status |
|---|---|---|
| VITE_SUPABASE_URL | src/lib/supabase.ts | **MISSING — no .env.local file** |
| VITE_SUPABASE_ANON_KEY | src/lib/supabase.ts | **MISSING — no .env.local file** |

## SDK Initialization

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Client is imported directly in components/hooks — no provider pattern.

## Analytics / Monitoring

None configured.
