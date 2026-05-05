# Coding Conventions

**Analysis Date:** 2026-05-05

## Naming Patterns

**Files:**
- PascalCase for components: `EntryGate.tsx`, `BunkerGate.tsx`, `ShimmerCore.tsx`, `WarRoom.tsx`
- camelCase for libs, hooks, stores, logic: `supabase.ts`, `useTetherState.ts`, `patternStore.ts`, `nightlySynth.ts`
- SCREAMING_SNAKE_CASE for data manifests: `manifest.ts` exports `VALKYRIE_MANIFEST`, `C25K_WEEK_1_DAY_1`

**Functions / Hooks:**
- Hooks: `use` prefix, camelCase — `useTetherState`, `useJointOps`, `useArmory`, `usePatternObserver`
- Plain functions: camelCase — `generateRandomHandle`, `toTetherState`, `inferDomain`, `computeTopDomain`
- Default exports match filename exactly: `export default function BunkerGate`

**Types and Interfaces:**
- PascalCase throughout: `Profile`, `JointOp`, `TetherState`, `DailyPlan`, `ShimmerTarget`
- Explicit return type aliases for every hook: `TetherStateReturn`, `JointOpsReturn`, `ArmoryReturn`
- Discriminated union `kind` fields use lowercase string literals: `'iron' | 'road' | 'mat' | 'hub'`

**Constants:**
- SCREAMING_SNAKE_CASE: `VALKYRIE_MANIFEST`, `C25K_WEEK_1_DAY_1`, `DOMAIN_ALTERNATES`, `CHECKPOINT_ALTERNATE`, `DEFAULTS`, `AUTH_TIMEOUT_MS`, `COLORS`
- Module-level constant blocks declared above component/function body

**Database Columns:**
- snake_case matching Postgres: `is_crisis_mode`, `onboarding_pending`, `one_rm_kg`, `clash_state`, `shimmer_mode`

**CSS Classes:**
- Web: Tailwind v4 utility classes inline — no BEM, no CSS modules
- Native: `StyleSheet.create()` with a `COLORS` constant object at the top of each screen file

## TypeScript Rules

**Compiler flags (enforced in `tsconfig.app.json`):**
- `verbatimModuleSyntax: true` — pure type imports use `import type { Foo }` or `import { value, type Foo }`. Never bare `import { Foo }` for type-only imports.
- `noUnusedLocals: true` — no declared-but-unused variables
- `noUnusedParameters: true` — no unused function parameters
- `erasableSyntaxOnly: true` — no TypeScript-only runtime syntax (no `const enum`, no namespaces)
- `noFallthroughCasesInSwitch: true` — every switch case must break or return
- `jsx: "react-jsx"` — JSX transform is automatic; do NOT `import React from 'react'` in native files (triggers TS6133 unused import)

**Type import examples from codebase:**
```ts
// Pure type import
import type { BitchWeightFlag, TrickyCardioGate } from './useTetherState';

// Mixed value + type import
import { supabase, type JointOp, type OpMember, type OpCheckpoint } from '../lib/supabase';
```

**Hook return types — always explicit:**
```ts
export type TetherStateReturn = { state: TetherState | null; isLoading: boolean; ... };
export function useTetherState(userId: string | null): TetherStateReturn { ... }

export type JointOpsReturn = { ops: JointOp[]; isLoading: boolean; ... };
export function useJointOps(userId: string | null): JointOpsReturn { ... }

export type ArmoryReturn = { bitchweights: ...; trickycardio: ... };
export function useArmory(userId: string | null): ArmoryReturn { ... }
```

**No `any` patterns** — `as string` casts used for env vars; `as ValkyrieTheme` for DB column narrowing; `as { is_anonymous?: boolean }` for Supabase JWT property not in SDK types.

**Type narrowing pattern for pre-migration DB columns:**
```ts
type RawRow = Profile & { is_nightmare_active?: boolean; theme_state?: string };
// Then narrow with ?? defaults inside a mapper function (toTetherState)
```

## Component Structure

All components are functional React with this ordering:
1. Props type defined above component
2. `useState` declarations with explicit generic type
3. `useRef` declarations
4. `useEffect` for data loading (calls inner `async` function)
5. `useCallback`-wrapped event handlers and async operations
6. Conditional early returns (loading / error state)
7. JSX return

No class components. No higher-order components. No Context API for data threading.

**Pattern:**
```ts
type Props = { onEnter: (mode: 'chill' | 'sos', userId: string | null) => void };

export default function BunkerGate({ onEnter }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // ...useEffect, useCallback, return JSX
}
```

## Import Organization

Order observed across all files:
1. React (named hooks only — no default `React` import)
2. React Native primitives (native files only)
3. Third-party libraries (`@react-navigation`, `@supabase/supabase-js`, `zustand`, `three`)
4. Internal `lib/` (supabase client, agentLog)
5. Internal `hooks/`
6. Internal `stores/`
7. Internal `components/`
8. Internal `registry/` or `logic/`
9. Relative `./ manifest` or sibling files

## Style and Linting

**Linting:** ESLint flat config (`eslint.config.js`) with:
- `@eslint/js` recommended
- `typescript-eslint` recommended
- `eslint-plugin-react-hooks` flat recommended
- `eslint-plugin-react-refresh` vite preset
- Scope: all `**/*.{ts,tsx}` files; `dist/` ignored

**Formatting:** No Prettier config — manual/editor formatting. Consistent 2-space indentation observed throughout.

**Type-check command (use this, not bare `tsc`):**
```bash
npx tsc --project tsconfig.app.json --noEmit
```
Bare `npx tsc --noEmit` may return 0 due to cached `.tsbuildinfo` even when errors exist.

## Async and useCallback Pattern

All async Supabase operations are wrapped in `useCallback` to prevent recreation on re-render:
```ts
const updateTheme = useCallback(async (theme: ValkyrieTheme) => {
  // DB write first, then setState
  const { data, error } = await supabase.from('profiles').update(...).select().single();
  if (!error && data) setState(toTetherState(data));
}, [userId]);
```

## State Management

**Rule:** Local `useState` only. Supabase is source of truth.

**DB-first pattern** — always write to Supabase before updating local state. No optimistic updates except one approved exception:
```ts
// Approved exception: ops list prepend on createOp (useJointOps.ts)
setOps(prev => [data, ...prev]);
```

**Interval + ref pattern** — when `setInterval` needs frequently-changing state, mirror into a `useRef` kept in sync via `useEffect` with a single dep. Read the ref inside the interval, not the state variable.

**Zustand — R3F bridge only:**
- Store: `src/stores/patternStore.ts`
- Write from React: reactive selector in `usePatternObserver.ts`
- Read in `useFrame`: `usePatternStore.getState()` (non-reactive direct read)
- Do NOT use Zustand for any state without a render-loop consumer

**`userId` threading:** Passed down as a prop from `EntryGate` → `App` → `WarRoom` → `useTetherState(userId)`. Not stored in global context.

## Logging

Use the project logger — never bare `console.log` (except `console.error` seen in `RoadSession` — treat as legacy):

```ts
import { agentLog } from '../lib/agentLog';

agentLog.architect('Loading profile for userId: ...');   // ops/debug
agentLog.valkyrie('The Queen sees you. You\'re not alone.');  // persona/narrative
```

## Comment Conventions

- Block comments `/* */` for complex multi-step logic (1RM formula suite in `PushDayOnboarding.tsx`)
- JSDoc `/** */` for exported pure functions: `calculate1RM`, `synthesizeDay`
- Inline `//` for state machine invariants and non-obvious guard conditions
- `// TODO:` for known stubs — e.g. `// TODO: SOS onboarding / fitness module screens go here`
- Priority comments in priority-ordered switch blocks: `// Priority 1: ... // Priority 2: ...`

## Error Handling

**Pattern in hooks:** Check `error || !data` after every Supabase call. Log with `agentLog.architect()`. Set `error` state with `new Error(message ?? 'fallback string')`. Never throw from hooks.

```ts
if (fetchError || !data) {
  setError(new Error(fetchError?.message ?? 'Profile bootstrap failed'));
  agentLog.architect(`ERROR creating profile: ${fetchError?.message}`);
}
```

**Pattern in pure logic (`nightlySynth.ts`):** Return empty arrays / safe defaults on error. Never throw from synthesis functions.

## Pure Logic Module (`src/logic/synthesis/`)

- No React, no hooks, no UI imports
- Exported via `src/logic/synthesis/index.ts`
- Types live in `DailyPlanSchema.ts`; implementation in `nightlySynth.ts`
- JSDoc on all exported functions
- `DailyPlanEvent.alternate` is always non-nullable — the synthesizer guarantees this invariant

## Central Type Registry

All Supabase database types are declared in `src/lib/supabase.ts` — this is the single source of truth for:
- `Profile`, `LifeSectors`, `JointOp`, `OpMember`, `OpCheckpoint`, `HRReading`, `OpHRSync`

Add new DB types here, not in consuming hooks.

---

*Convention analysis: 2026-05-05*
