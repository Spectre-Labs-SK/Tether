# Architecture

## Pattern

**React SPA with mode-based routing.** No router library — `App.tsx` holds a top-level `appMode` state (`'gate' | 'chill' | 'sos'`) and conditionally renders one of three shells:

```
App
├── appMode === 'gate'  → EntryGate
├── appMode === 'chill' → WarRoom (+ ShimmerCore 3D inline)
└── appMode === 'sos'   → SOSShell
```

The native screens in `src/native/` form a **parallel, disconnected architecture** — they assume a React Navigation stack but have no Expo/React Native build system wired up. They share the Supabase client and Valkyrie registry but are not imported by the web app.

## Navigation

### Web
- `App.tsx` — direct `useState` routing, no library
- `EntryGate` fires `onEnter('chill' | 'sos')` callback to App

### Native (disconnected)
- React Navigation `NativeStack` assumed
- `FitnessOnboardingGrid` → `PushDayOnboarding | RoadSession | MatSession | HubSession`
- `RootStackParamList` defined locally in `PushDayOnboarding.tsx` — not shared across screens

## State Management

No global state library. All state is local `useState` + custom hooks:

| Hook | State | Scope |
|---|---|---|
| `useTetherState(userId)` | profile, uiConfig, isLoading, isUntracked | Per-session profile + crisis mode |
| `useJointOps(userId)` | ops[], isLoading | Collaborative operations list |

State mutations go through Supabase (DB write first, then local state update) — no optimistic updates except `useJointOps` ops list prepend on createOp.

## Data Flow

```
supabase.auth.onAuthStateChange
  → userId resolved in EntryGate
  → passed into useTetherState(userId)
    → loads profile from Supabase
    → exposes triggerCrisisMode / exitCrisisMode / completeOnboarding
    → crisis_mode flag drives uiConfig ('minimalist' | 'full')
```

Workout data flow (native, not yet connected to web):
```
PushDayOnboarding
  → calculate1RM() local math (Epley + Brzycki + Lander consensus)
  → supabase edge function: sync-workout
  → writes to workouts / workout_sets / one_rm_history tables
```

## Component Hierarchy

```
App
├── EntryGate
│   ├── useTetherState (profile, triggerCrisisMode)
│   └── VALKYRIE_MANIFEST (display: codename, helmet name)
├── WarRoom
│   └── Canvas > ShimmerCore (inline Three.js sphere — DUPLICATE of components/ShimmerCore.tsx)
└── SOSShell (stub — TODO placeholder only)

src/components/ShimmerCore.tsx — standalone extracted component (NOT used anywhere)
```

## Key Architectural Decisions

1. **Anonymous-first auth**: No account creation required. Supabase anonymous sessions provide userId without sign-up friction. Critical for SOS flow.
2. **Shimmer Framework modes**: `MILITARY` (#1e293b slate) vs `ETHER` (#6d28d9 purple) — same geometry, different material color. Mode propagates via prop drilling.
3. **Agent persona logging**: `agentLog.architect()` / `agentLog.valkyrie()` — branded console format, not structured logging. Both defined in `src/lib/agentLog.ts`.
4. **Native screens co-located with web**: `src/native/` is explicitly excluded from tsconfig compilation but lives in the same repo. Intended for eventual Expo extraction.
5. **DB-write-first pattern**: `completeOnboarding()` writes to Supabase before updating local state to prevent UI advancing ahead of persistence.
6. **Valkyrie Registry**: `src/registry/valkyrie/` holds gear manifest and Ronin House definitions — shared between web (EntryGate display) and native (PushDayOnboarding context).
