# Coding Conventions

**Analysis Date:** 2026-04-22

## Naming Patterns

**Files:**
- React components: PascalCase `.tsx` — `EntryGate.tsx`, `ShimmerCore.tsx`, `PushDayOnboarding.tsx`
- Custom hooks: camelCase with `use` prefix `.ts` — `useTetherState.ts`, `useJointOps.ts`
- Utility/lib modules: camelCase `.ts` — `agentLog.ts`, `supabase.ts`
- Type registries and manifests: camelCase `.ts` — `manifest.ts`, `houses.ts`
- Static data/config: SCREAMING_SNAKE_CASE constants — `VALKYRIE_MANIFEST`, `IRON_ACTIVITIES`, `DOMAINS`, `PUSH_DAY_CONFIGS`

**Functions:**
- React components: PascalCase — `function EntryGate()`, `export default function App()`
- React hooks: camelCase with `use` prefix — `useTetherState`, `useJointOps`
- Event handlers: camelCase with `handle` prefix — `handleSOS`, `handleChill`, `handleReset`, `handleDomainSelect`, `handleActivitySelect`
- Pure utility functions: camelCase — `generateRandomHandle()`, `buildEmptySets()`, `calculate1RM()`
- 1RM formula helpers: lowercase single-word — `epley()`, `brzycki()`, `lander()`

**Variables:**
- State variables: camelCase — `isLoading`, `authReady`, `exerciseLogs`, `selectedDomain`
- State pairs: `[noun, setNoun]` pattern consistently — `[profile, setProfile]`, `[ops, setOps]`
- Constants: SCREAMING_SNAKE_CASE — `CARDIO_THRESHOLD_BPM`, `REQUIRED_CARDIO_MINUTES`, `ADJECTIVES`, `NOUNS`
- Color palettes: `COLORS` object with semantic keys — `bg`, `surface`, `border`, `accent`, `text`, `textMuted`

**Types:**
- Type aliases: PascalCase — `AppMode`, `UIConfig`, `ShimmerMode`, `Domain`
- Interfaces: PascalCase — `ExerciseConfig`, `SetEntry`, `ExerciseLog`, `RoninHouse`
- Return types from hooks: PascalCase with `Return` suffix — `TetherStateReturn`, `JointOpsReturn`
- Navigation param lists: PascalCase with `ParamList` suffix — `RootStackParamList`
- Props types: inline `{ prop: Type }` for simple cases; named `type Props = { ... }` for component props
- Branded domain-specific types: PascalCase — `BitchWeightFlag`, `TrickyCardioGate`

**Enum-like string unions:**
- String union types preferred over TypeScript enums throughout — `'MILITARY' | 'ETHER'`, `'active' | 'standby' | 'complete' | 'aborted'`

## Code Style

**Formatting:**
- No Prettier config detected — formatting is manual/editor-driven
- Semicolons: mixed — used in `.tsx` files (App.tsx, EntryGate.tsx), sometimes absent in `.ts` files (main.tsx)
- Quotes: single quotes in TypeScript/TSX source files consistently
- Trailing commas: used in multi-line objects and arrays
- Indentation: 2 spaces throughout

**Linting:**
- ESLint flat config (`eslint.config.js`) with `eslint/config`
- Rules: `@eslint/js` recommended + `typescript-eslint` recommended + `react-hooks` recommended + `react-refresh` vite preset
- TypeScript strict checks: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly`
- Target: `ecmaVersion: 2020`, browser globals

## Import Organization

**Order (observed pattern):**
1. React and React hooks — `import { useState, useEffect, useCallback } from 'react'`
2. Third-party libraries — `import { Canvas } from '@react-three/fiber'`, `import { supabase } from '@supabase/supabase-js'`
3. Internal hooks — `import { useTetherState } from '../hooks/useTetherState'`
4. Internal lib/utilities — `import { agentLog } from '../lib/agentLog'`
5. Internal registries/manifests — `import { VALKYRIE_MANIFEST } from '../registry/valkyrie/manifest'`
6. CSS/styles — `import './index.css'`

**Import style:**
- Named imports for hooks and utilities: `import { useState, useEffect } from 'react'`
- Default imports for components: `import EntryGate from './components/EntryGate'`
- `import type` used for type-only imports throughout: `import type { NativeStackNavigationProp } from '@react-navigation/native-stack'`
- Mixed value + type imports with `type` keyword inline: `import { supabase, type Profile } from '../lib/supabase'`

**Path Aliases:**
- None configured — all paths are relative (`../`, `../../`, `./`)

## Error Handling

**Supabase pattern (DB-first, confirmed state):**
```typescript
const { data, error } = await supabase.from('table').select('*').eq('id', id).single();
if (error || !data) {
  agentLog.architect(`ERROR doing thing: ${error?.message}`);
  // handle gracefully, no throw
} else {
  setLocalState(data);
}
```

**Critical rule (from cerebrum):** Never optimistic-update local state before Supabase confirms. Always DB-first → then `setState(data)`.

**Hooks return safe defaults on missing userId:**
```typescript
if (!userId) return [];        // bitchweights()
if (!userId) return base;      // trickycardio()
if (!userId || !profile) return;  // triggerCrisisMode, exitCrisisMode
```

**React Native screens use `Alert.alert()` for user-facing errors:**
```typescript
Alert.alert('Connection Error', 'Could not load exercise catalog. Check your network and try again.');
```

**No throwing:** Errors are logged via `agentLog` and handled gracefully; no `throw` statements in application code.

## Logging

**Framework:** `agentLog` — custom wrapper in `src/lib/agentLog.ts`

**Two channels:**
```typescript
agentLog.architect(`Loading profile for userId: ${userId}`);   // System/technical events
agentLog.valkyrie(`Ghost operative online. Identity shielded.`); // Brand voice / user narrative
```

**Pattern:** Log at the start of async operations, log success with data, log errors with `error?.message`. The `valkyrie` channel provides flavor text in addition to the `architect` technical log on important events.

**When to use each:**
- `architect`: data loading, DB operations, state transitions, errors
- `valkyrie`: user-facing milestones, emotional beats, completion states

## Comments

**File-level JSDoc blocks:** Used in `PushDayOnboarding.tsx` to document screen purpose and exercise list:
```typescript
/**
 * SPECTRE LABS — TETHER MOBILE
 * Screen: Push Day Onboarding
 * Target: Expo SDK / React Native
 */
```

**Section dividers in large files:** ASCII separator comments used for readability:
```typescript
// ---------------------------------------------------------------------------
// 1RM Formula Suite
// ---------------------------------------------------------------------------
```

**Inline function JSDoc:** Used for pure utility functions documenting formula source and behavior:
```typescript
/** Epley (1985): 1RM = w × (1 + r/30). Preferred for 1–10 rep range. */
function epley(weightKg: number, reps: number): number { ... }
```

**Inline intent comments:** Explain non-obvious decisions inline:
```typescript
// onAuthStateChange fires INITIAL_SESSION immediately on subscribe — handles restoration
// of existing anonymous sessions from localStorage without a network round-trip.
```

**TODO comments:** Single active TODO in `src/App.tsx` line 95: `{/* TODO: SOS onboarding / fitness module screens go here */}`

**Bug/compliance tags:** Inline cross-references to bug IDs: `// B-000 KILL SWITCH — Feu Follet Charter compliance.`

## Function Design

**Size:** Pure functions are small (5–15 lines). Hook functions can be large (useTetherState ~280 lines) but are internally subdivided with section comments.

**Parameters:** Prefer specific types over `any`. Optional params use `?` not `| undefined`. Default parameters used in hooks: `shimmerMode: 'MILITARY' | 'ETHER' = 'MILITARY'`.

**Return Values:**
- Hooks always return a typed object: `return { profile, uiConfig, isLoading, ... }`
- Async functions return `Promise<T>` with explicit return type annotations on hook methods
- Functions that may fail return `null` rather than throwing: `Promise<JointOp | null>`
- `useCallback` wraps async functions defined inside hooks to prevent recreating on every render

## Module Design

**Exports:**
- Components: default export
- Hooks: named export
- Types and constants: named exports
- Utilities: named object export (`export const agentLog = { ... }`)

**`satisfies` operator:** Used to enforce type compatibility while preserving literal types:
```typescript
exercises: [ ... ] satisfies ValkyrieExercise[]
```

**`as const`:** Applied to manifest objects to preserve literal string types:
```typescript
export const VALKYRIE_MANIFEST = { ... } as const;
```

**Barrel files:** Not used — each module is imported directly by path.

## Dual Codebase Split

**Critical architectural constraint:** The Vite web build (`src/`) and the Expo/React Native build (`src/native/`) coexist in the same repo. `tsconfig.app.json` explicitly excludes `src/native` via `"exclude": ["src/native"]`. Native screens must never be imported by web code.

**Web-only:** `src/App.tsx`, `src/components/`, `src/hooks/`, `src/lib/`
**Native-only:** `src/native/screens/`
**Shared:** `src/registry/valkyrie/` (imported by both web and native code)

---

*Convention analysis: 2026-04-22*
