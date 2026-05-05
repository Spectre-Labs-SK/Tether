# Testing Patterns

**Analysis Date:** 2026-05-05

## Test Framework

**Runner:** None installed.

No test runner (Jest, Vitest, Playwright, Detox) is present in `package.json` devDependencies. No `jest.config.*`, `vitest.config.*`, or `playwright.config.*` found at project root.

**Test files in project source:** Zero. No `*.test.*` or `*.spec.*` files exist under `src/`.

**Run Commands:**
```bash
# No test command in package.json scripts
npm run lint                                       # ESLint — only automated quality gate
npx tsc --project tsconfig.app.json --noEmit       # Type-check web build accurately
```

The only quality gates are TypeScript type-checking and ESLint linting. No runtime tests of any kind.

## Coverage

**Automated coverage:** 0% — no coverage tooling configured.

**TypeScript as a partial test layer:**
The strict compiler config enforces compile-time correctness for:
- Hook return type contracts: `TetherStateReturn`, `JointOpsReturn`, `ArmoryReturn` in their respective files
- Discriminated union exhaustion in switch/case (via `noFallthroughCasesInSwitch`)
- DB type shapes in `src/lib/supabase.ts`
- `DailyPlanEvent.alternate` non-nullability enforced by type (field is `DailyPlanAlternate`, never `| null`)

**Manual UAT:**
Phase-level acceptance testing is logged in `.planning/phases/01-pattern-observer-threejs/01-HUMAN-UAT.md`. Human-run checklists only, not automated.

## Test Coverage Gaps

**Pure Logic — highest priority, no mocks needed:**

| Item | File | Risk |
|---|---|---|
| `synthesizeDay` aggregation logic | `src/logic/synthesis/nightlySynth.ts` | High |
| `inferDomain` name-matching heuristic | `src/logic/synthesis/nightlySynth.ts` | Medium |
| `computeTopDomain` event counting | `src/logic/synthesis/nightlySynth.ts` | Medium |
| `DOMAIN_ALTERNATES` invariant (always cross-domain) | `src/logic/synthesis/nightlySynth.ts` | Medium |
| `toTetherState` mapper (pre-migration column defaults) | `src/hooks/useTetherState.ts` | Medium |
| `generateRandomHandle` format | `src/hooks/useTetherState.ts` | Low |
| `calculate1RM` Epley/Brzycki/Lander consensus | `src/native/screens/PushDayOnboarding.tsx` | Medium |
| `brzycki()` edge case: `reps >= 37` guard returns 0 | `src/native/screens/PushDayOnboarding.tsx` | Medium |

**Hook Layer — requires Supabase mock:**

| Item | File | Risk |
|---|---|---|
| Profile bootstrap path (no existing profile) | `src/hooks/useTetherState.ts` | High |
| Crisis mode auto-patch write | `src/hooks/useTetherState.ts` | High |
| Kill switch: clears state, fires signOut async | `src/hooks/useTetherState.ts` | Medium |
| `bitchweights()` 6-week 1RM delta boundary | `src/hooks/useArmory.ts` | High |
| `trickycardio()` 45-min window + 5-min threshold | `src/hooks/useArmory.ts` | High |
| Ops deduplication (owned + member overlap) | `src/hooks/useJointOps.ts` | Medium |
| Ops list prepend on `createOp` | `src/hooks/useJointOps.ts` | Low |
| Member fallback to owned-only on membership fetch error | `src/hooks/useJointOps.ts` | Medium |

**Component Layer — requires React renderer:**

| Item | File | Risk |
|---|---|---|
| `AUTH_TIMEOUT_MS` (3000ms) fires → offline state | `src/components/BunkerGate.tsx` | High |
| Auth state change → online, userId set | `src/components/BunkerGate.tsx` | High |
| SIGNED_OUT event → offline, userId cleared | `src/components/BunkerGate.tsx` | Medium |
| Anonymous sign-in → `onEnter` called with userId | `src/components/BunkerGate.tsx` | High |
| Anonymous → permanent upgrade via `updateUser` | `src/components/EntryGate.tsx` | High |

**Security Paths — critical, untested:**

| Item | File | Risk |
|---|---|---|
| `sync-workout` ownership guard (profileId check) | `supabase/functions/sync-workout/` | Critical |
| `calculate-1rm` 401 gate for unauthenticated requests | `supabase/functions/calculate-1rm/` | High |

## Recommended Testing Strategy (When Tests Are Added)

**Framework choices:**
- Unit + hook tests: **Vitest** — zero config overhead, already uses Vite. Add `vitest` to devDeps.
- Hook rendering: `@testing-library/react` + Vitest
- Native screen tests: `@testing-library/react-native` + Jest with `babel-preset-expo`
- E2E: **Detox** — Expo-compatible; future consideration

**Suggested config placement:**
```
vitest.config.ts     # src/ scope (web/shared logic)
jest.config.cjs      # src/native/ scope (Expo/Metro)
```

**Test file placement:**
Co-locate with source — `src/logic/synthesis/nightlySynth.test.ts`, `src/hooks/useTetherState.test.ts`.

**Mocking strategy:**
- Supabase: `vi.mock('../lib/supabase')` — return shaped `{ data, error }` objects
- `agentLog`: `vi.mock('../lib/agentLog')` — suppress output in test runs
- Three.js / R3F: mock `@react-three/fiber` `useFrame` for `patternStore` bridge tests
- Auth: mock `supabase.auth.onAuthStateChange` and `supabase.auth.getSession`

**Priority order:**
1. `src/logic/synthesis/nightlySynth.ts` — pure TS, zero dependencies to mock
2. `src/hooks/useTetherState.ts` — `toTetherState` mapper (pure function extraction)
3. `src/hooks/useArmory.ts` — threshold boundary conditions with mocked Supabase
4. `src/components/BunkerGate.tsx` — timeout + auth state transitions (mock timers)

## Anti-Patterns to Avoid

- Do not type-check with bare `npx tsc --noEmit` — use `npx tsc --project tsconfig.app.json --noEmit` to bypass cached `.tsbuildinfo`
- Do not import from `src/native/` in web/shared test files — excluded from `tsconfig.app.json`
- Do not write optimistic-update tests — DB-first means state only changes after Supabase confirms (except the approved ops-list prepend in `useJointOps`)
- Do not mock `useState` or `useEffect` internals — test observable behavior only

---

*Testing analysis: 2026-05-05*
