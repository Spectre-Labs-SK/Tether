# Conventions

## Naming

| Category | Convention | Example |
|---|---|---|
| Components | PascalCase | `EntryGate`, `ShimmerCore` |
| Hooks | camelCase with `use` prefix | `useTetherState`, `useJointOps` |
| Types/Interfaces | PascalCase | `Profile`, `JointOp`, `UIConfig` |
| Constants/Manifests | SCREAMING_SNAKE_CASE | `VALKYRIE_MANIFEST`, `RONIN_HOUSES`, `C25K_WEEK_1_DAY_1` |
| Files | PascalCase for components, camelCase for libs/hooks | `EntryGate.tsx`, `supabase.ts` |
| Database columns | snake_case (Postgres convention) | `is_crisis_mode`, `one_rm_kg` |
| CSS classes | Tailwind utility classes (no BEM, no modules) | `font-mono tracking-widest` |

## TypeScript

- **tsconfig strict-ish**: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly`
- `verbatimModuleSyntax: true` — all type imports must use `import type`
- Types exported from `src/lib/supabase.ts` as the central type registry
- Hook return types explicitly typed (e.g., `TetherStateReturn`, `JointOpsReturn`)
- No `any` patterns observed; `as string` casts used for env vars
- `useCallback` used on all async Supabase operations to prevent recreation on re-render

## Component Structure

All components are functional React. Pattern:
1. Props type defined above component
2. useState declarations
3. useEffect for data loading
4. Event handlers (async functions)
5. Conditional early returns (loading state)
6. JSX return

No higher-order components. No class components.

## Imports

Order convention observed:
1. React (and hooks)
2. Third-party libraries
3. Internal: lib/ before hooks/ before components/ before registry/

Native screens additionally import React Native primitives first.

## Style / Linting

- **Web**: Tailwind CSS v4 utility classes inline. No CSS modules. No styled-components.
- **Native**: `StyleSheet.create()` with inline COLORS constants at file top
- ESLint flat config — react-hooks and react-refresh plugins
- No Prettier config detected — formatting is manual/editor

## Comment Conventions

- Multi-line block comments for complex logic (1RM formula suite in PushDayOnboarding)
- JSDoc `/** */` for exported pure functions (e.g., `calculate1RM`)
- Inline `//` for state machine invariants and non-obvious guard conditions
- `agentLog.architect()` for operational/debug logs (replaces console.log)
- `agentLog.valkyrie()` for persona/narrative feedback logs
- TODO comments for known stubs: `// TODO: SOS onboarding / fitness module screens go here`

## State Management Conventions

- Local `useState` only — no Redux, Zustand, Jotai, or Context API
- Supabase is the source of truth; local state mirrors DB
- DB write always precedes local state update (no optimistic updates, except ops list prepend on createOp)
- `userId` flows down from `EntryGate` → `useTetherState` as a prop; not stored in global context
