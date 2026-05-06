# Code Conventions

**Last mapped:** 2026-05-05

## TypeScript

**Compiler settings** (`tsconfig.app.json`):
- `target`: `es2023`, `module`: `esnext`, `moduleResolution`: `bundler`
- `verbatimModuleSyntax: true` — enforced strictly
- `noUnusedLocals: true`, `noUnusedParameters: true`
- `erasableSyntaxOnly: true`, `noFallthroughCasesInSwitch: true`
- `noEmit: true` — Vite owns compilation; tsc is type-check only

**Type-check command** (use this, not bare `tsc --noEmit`):
```bash
npx tsc --project tsconfig.app.json --noEmit
```

**Import style — verbatimModuleSyntax rules:**

Pure type import:
```typescript
import type { BitchWeightFlag, TrickyCardioGate } from './useTetherState';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
```

Mixed value + type (both forms acceptable):
```typescript
// Inline type keyword on the type-only import:
import { supabase, type Profile } from '../lib/supabase';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import { DOMAINS, type Domain, type Activity } from './manifest';
```

**React import rule for native files:**
Do NOT write `import React from 'react'` in `src/native/` files. `react/jsx-runtime` handles JSX automatically. `noUnusedLocals` will flag it as TS6133.

**All hook return types must be explicitly named types:**
```typescript
export type TetherStateReturn = { ... };
export function useTetherState(userId: string | null): TetherStateReturn { ... }

export type JointOpsReturn = { ... };
export function useJointOps(userId: string | null): JointOpsReturn { ... }

export type ArmoryReturn = { ... };
export function useArmory(userId: string | null): ArmoryReturn { ... }
```

**Type exports from module files:**
Export types alongside values from the same module file (e.g., `src/lib/supabase.ts` exports both the client and all DB types). Use `export type` at the declaration site or mixed-import syntax at the use site.

**Discriminated unions for event data:**
```typescript
// DailyPlanSchema.ts pattern — `kind` as discriminant
export type DailyPlanEventData = IronEventData | SessionEventData | CheckpointEventData;
// where IronEventData has kind: 'iron', SessionEventData kind: 'road' | 'mat' | 'hub', etc.
```

**Non-nullable contract enforcement via type (not optional):**
```typescript
// DailyPlanEvent.alternate is non-nullable by type contract — never make it optional
export type DailyPlanEvent = {
  alternate: DailyPlanAlternate;   // NOT alternate?: DailyPlanAlternate
};
```

**Safe defaults for pre-migration fields:**
```typescript
// Pattern from useTetherState.ts: supply defaults in a mapper function
function toTetherState(raw: RawRow): TetherState {
  return {
    is_nightmare_active: raw.is_nightmare_active ?? false,
    theme_state: (raw.theme_state as ValkyrieTheme | undefined) ?? 'MILITARY',
    ...
  };
}
```

---

## Naming

| Category | Convention | Example |
|---|---|---|
| React components | PascalCase | `EntryGate`, `ShimmerCore`, `WarRoom` |
| Hooks | `use` prefix, camelCase | `useTetherState`, `useJointOps`, `useArmory` |
| Types / Interfaces | PascalCase | `Profile`, `JointOp`, `TetherStateReturn` |
| Constants / Manifests | SCREAMING_SNAKE_CASE | `VALKYRIE_MANIFEST`, `C25K_WEEK_1_DAY_1`, `DOMAIN_ALTERNATES` |
| Database columns | snake_case | `is_crisis_mode`, `one_rm_kg`, `random_handle` |
| Component files | PascalCase `.tsx` | `EntryGate.tsx`, `FitnessOnboardingGrid.tsx` |
| Hook files | camelCase `.ts` | `useTetherState.ts`, `useJointOps.ts` |
| Lib/utility files | camelCase `.ts` | `supabase.ts`, `agentLog.ts` |
| Schema/type files | PascalCase `.ts` | `DailyPlanSchema.ts` |
| Constant files | camelCase `.ts` | `manifest.ts`, `houses.ts` |
| Native screen files | PascalCase `.tsx` | `PushDayOnboarding.tsx`, `RoadSession.tsx` |

**Domain casing distinction:**
- Activity domain enum values in `DailyPlanSchema.ts`: lowercase (`'iron' | 'road' | 'mat' | 'hub'`)
- Domain display names in `manifest.ts` and `usePatternObserver.ts`: TitleCase (`'Iron' | 'Road' | 'Mat' | 'Hub'`)
- Keep these separate — they are used in different contexts and must not be confused.

**shimmer_mode string literals:** `'MILITARY' | 'ETHER'` — always uppercase. Defined as `ValkyrieTheme` in `src/hooks/useTetherState.ts` and `ShimmerMode` in `src/registry/valkyrie/houses.ts`.

---

## Code Style

**Module-top constants pattern (native screens):**
Every native screen file defines a file-local `COLORS` object at module top, followed by a `StyleSheet.create()` call at the bottom. These are never imported from a shared module — each screen owns its palette inline.

```typescript
// At file top (after imports):
const COLORS = {
  bg: '#0f172a',
  surface: '#1e293b',
  accent: '#3b82f6',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  success: '#10b981',
};

// At file bottom:
const styles = StyleSheet.create({ ... });
```

**Web component styling:** Tailwind v4 inline utility classes. No `StyleSheet.create()` in `src/components/`.

**Callback pattern for hooks:** All async operations in hooks are wrapped in `useCallback` with explicit return types:
```typescript
const createOp = useCallback(async (
  codename: string,
  shimmerMode: 'MILITARY' | 'ETHER' = 'MILITARY',
  notes?: string,
): Promise<JointOp | null> => { ... }, [userId]);
```

**Default parameter values over optional checks:**
```typescript
// Prefer:
shimmerMode: 'MILITARY' | 'ETHER' = 'MILITARY'
role: OpMember['role'] = 'operative'
// Over: if (!shimmerMode) shimmerMode = 'MILITARY'
```

**DB-first state mutation:** Write to Supabase first, then update local state from the returned data. Never optimistic-update before Supabase confirms (exception: `createOp` prepends to ops list before full profile reload).

```typescript
// Correct pattern:
const { data, error } = await supabase.from('profiles').update({ theme_state: theme }).eq('id', userId).select().single();
if (!updateError && data) setState(toTetherState(data));
```

**Zustand for R3F only:** Use Zustand (`src/stores/patternStore.ts`) exclusively for state that must be read inside a Three.js `useFrame` loop. All other state is local `useState` or Supabase-backed.

```typescript
// Reading from store inside useFrame (non-reactive):
store.getState()
// Writing to store from React:
usePatternStore((state) => state.setTarget)
```

**Auth anonymous-flag casting:**
```typescript
// is_anonymous is not in TS SDK types but exists in the JWT:
(session.user as { is_anonymous?: boolean }).is_anonymous
```

**Ref pattern for timer callbacks (native screens):**
Use `useRef` to carry mutable index/state into `setInterval` callbacks to avoid closure staleness and effect re-runs:
```typescript
const currentIntervalIndexRef = useRef(currentIntervalIndex);
useEffect(() => { currentIntervalIndexRef.current = currentIntervalIndex; }, [currentIntervalIndex]);
```

**Interface vs type:** Prefer `type` for object shapes and unions. `interface` is used in `manifest.ts` for domain data models (`Activity`, `RoadActivity`, `Interval`). Both are acceptable but `type` is predominant.

---

## Error Handling

**Hooks — Supabase error pattern:**
Check `error` and `!data` together. Set `error` state with `new Error(message)`. Log via `agentLog.architect()`. Never throw from hooks.

```typescript
const { data, error: fetchError } = await supabase.from('profiles').select('*').eq('id', userId).single();
if (fetchError || !data) {
  setError(new Error(fetchError?.message ?? 'Profile bootstrap failed'));
  agentLog.architect(`ERROR creating profile: ${fetchError?.message}`);
}
```

**Callbacks that can fail — return null pattern:**
```typescript
// From useJointOps.ts — mutations that fail return null, not throw
const createOp = useCallback(async (...): Promise<JointOp | null> => {
  const { data, error } = await supabase...
  if (error || !data) {
    agentLog.architect(`ERROR creating joint op: ${error?.message}`);
    return null;
  }
  ...
}, [userId]);
```

**Void callbacks that fail — log and return:**
```typescript
// Mutations returning Promise<void> on failure just log and return early
if (error) {
  agentLog.architect(`ERROR updating op status: ${error.message}`);
  return;
}
```

**Native screens — try/catch for Supabase writes:**
Native screen components use `try/catch` + `console.error` (not `agentLog`) for Supabase persistence calls. This is a convention divergence from hooks (see CONCERNS.md).

```typescript
try {
  const { error } = await supabase.from('hub_sessions').insert({ ... });
  if (error) console.error('[HubSession] Save error:', error.message);
} catch (err) {
  console.error('[HubSession] Session save failed:', err);
}
```

**Empty/fallback returns:** Functions returning arrays return `[]` on error; functions returning objects return a safe default struct. Never return `undefined` where a typed return is expected.

---

## Logging

**Module:** `src/lib/agentLog.ts`

```typescript
export const agentLog = {
  architect: (msg: string) => console.log(`[Agent_Architect]: ${msg}`),
  valkyrie:  (msg: string) => console.log(`[Agent_Valkyrie]: ${msg}`),
};
```

**When to use each:**

| Function | Purpose | Example |
|---|---|---|
| `agentLog.architect()` | Operational/debug: data loads, errors, state transitions | `agentLog.architect('Loading profile for userId: ...')` |
| `agentLog.valkyrie()` | Persona/narrative: user-facing story moments, milestone confirmations | `agentLog.valkyrie('Profile created: ghost-hawk-42. The Queen sees you.')` |

**Always use `agentLog` in hooks and web components.** Never use bare `console.log` in `src/hooks/` or `src/components/`.

**Exception — native screens:** `src/native/screens/` files use `console.error` and `console.warn` directly for persistence errors. This is a known drift from the `agentLog` convention (see CONCERNS.md).

**Log format for errors:** Prefix with operation name + "ERROR":
```typescript
agentLog.architect(`ERROR creating profile: ${createError?.message}`);
agentLog.architect(`ERROR loading owned joint ops: ${ownedError.message}`);
```

**Log format for state transitions:**
```typescript
agentLog.architect(`Profile loaded: ${data.random_handle} | crisis=${data.is_crisis_mode} | onboarding=${data.onboarding_pending}`);
```

---

## Comments

**Block comments for non-obvious contracts:**
```typescript
// Supabase rows may contain pre-migration columns not yet reflected in Profile type.
type RawRow = Profile & { is_nightmare_active?: boolean; theme_state?: string };
```

**Inline rationale for architecture decisions:**
```typescript
// Refs carry mutable values into the interval callback so the effect only
// depends on isPaused — recreating every second caused timing drift on Android.
```

**JSDoc for public synthesis functions:**
```typescript
/**
 * Aggregates a user's activity data for a given date from Supabase and
 * returns a DailyPlan where every event carries a non-null alternate.
 * @param userId - Supabase profile id (auth.uid())
 * @param date   - ISO date string: yyyy-mm-dd
 */
```

**Phase annotations for stubbed code:**
```typescript
// Phase B: recovery view state
// TODO Phase 2: select manifest by activityId when multiple flows are available.
// userId is always null in Phase 1 — trickycardio and bitchweights states
// are registered but will never fire. Phase 2 wires userId through App().
```

**No comments on obvious code.** Comments explain why, not what.

---

*Convention analysis: 2026-05-05*
