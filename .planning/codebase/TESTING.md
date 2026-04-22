# Testing Patterns

**Analysis Date:** 2026-04-22

## Test Framework

**Runner:** None installed

No test runner, test framework, or assertion library is present in `package.json`. Neither `jest`, `vitest`, `mocha`, `@testing-library/react`, nor any equivalent package appears in `dependencies` or `devDependencies`.

**Test config files:** None detected (`jest.config.*`, `vitest.config.*` — absent)

**Test files:** Zero `.test.ts`, `.spec.ts`, `.test.tsx`, or `.spec.tsx` files found anywhere in the project.

**Run Commands:**
```bash
# No test commands exist — package.json scripts:
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Current State

This codebase has **no automated tests of any kind.** There is no unit, integration, or end-to-end test suite.

The only quality automation present is:
- TypeScript compiler (`tsc -b`) run as part of `npm run build`
- ESLint (`eslint .`) run via `npm run lint`

TypeScript strict checks provide some compile-time safety: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly`.

## Testable Units (if tests were added)

The following code is structured well enough to test without major refactoring:

**Pure functions in `src/native/screens/PushDayOnboarding.tsx`:**
- `calculate1RM(weightKg, reps)` — consensus 1RM formula; deterministic, no side effects
- `epley(weightKg, reps)`, `brzycki(weightKg, reps)`, `lander(weightKg, reps)` — individual 1RM formulas
- `buildEmptySets(targetSets)` — builds empty set array

**Pure function in `src/hooks/useTetherState.ts`:**
- `generateRandomHandle()` — random string generation (probabilistic test only)

**Logic in hooks (requires Supabase mocking):**
- `bitchweights()` — 6-week 1RM delta calculation logic
- `trickycardio()` — HR threshold gate logic

## Recommended Framework (when tests are added)

**Vitest** is the natural choice for this stack:
- Pairs with Vite (already used as the bundler)
- Zero config for TypeScript + ESM projects
- Compatible with `@testing-library/react` for component tests

```bash
# Install
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event

# Add to package.json scripts
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest run --coverage"
```

```typescript
// vite.config.ts addition
import { defineConfig } from 'vite';
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
```

## Recommended Test File Organization

**Co-located with source (preferred for this project size):**
```
src/
  native/screens/
    PushDayOnboarding.tsx
    PushDayOnboarding.test.ts    ← 1RM formula unit tests
  hooks/
    useTetherState.ts
    useTetherState.test.ts       ← hook logic tests (Supabase mocked)
    useJointOps.test.ts
  lib/
    agentLog.ts
    agentLog.test.ts
```

## Recommended Test Structure

**Unit test pattern for pure functions:**
```typescript
import { describe, it, expect } from 'vitest';
import { calculate1RM } from '../native/screens/PushDayOnboarding';

describe('calculate1RM', () => {
  it('returns 0 for invalid reps', () => {
    expect(calculate1RM(100, 0)).toBe(0);
    expect(calculate1RM(100, 37)).toBe(0);
  });

  it('returns weightKg unchanged for 1 rep', () => {
    expect(calculate1RM(100, 1)).toBe(100);
  });

  it('estimates higher than input weight for multiple reps', () => {
    expect(calculate1RM(80, 10)).toBeGreaterThan(80);
  });
});
```

**Hook test pattern (Supabase mocked):**
```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
    })),
  },
}));

describe('useTetherState', () => {
  it('sets isLoading false when userId is null', async () => {
    const { result } = renderHook(() => useTetherState(null));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isUntracked).toBe(true);
  });
});
```

## Mocking

**What to mock:**
- `src/lib/supabase.ts` — all Supabase DB and auth calls
- `src/lib/agentLog.ts` — suppress console output in tests
- React Native modules when testing native screens

**What NOT to mock:**
- `calculate1RM` and the 1RM formula helpers — these are the subject of testing
- `generateRandomHandle` — test the randomness properties, not mock away
- `src/registry/valkyrie/manifest.ts` and `houses.ts` — pure data, no side effects

## Fixtures

**No fixtures directory exists.** When added, recommended location:
```
src/__fixtures__/
  profiles.ts     ← mock Profile objects
  jointOps.ts     ← mock JointOp objects
  hrReadings.ts   ← mock HR reading arrays
```

## Coverage

**Requirements:** None enforced (no test runner configured)

**Recommended priority order when adding tests:**
1. **High** — `calculate1RM` and 1RM formula helpers in `src/native/screens/PushDayOnboarding.tsx`
2. **High** — `bitchweights()` delta logic in `src/hooks/useTetherState.ts`
3. **High** — `trickycardio()` gate logic in `src/hooks/useTetherState.ts`
4. **Medium** — `useTetherState` loading/error/crisis-mode state transitions
5. **Medium** — `useJointOps` CRUD operations
6. **Low** — `EntryGate` component rendering and auth flow (requires heavy mocking)

## Test Types

**Unit Tests:**
- Appropriate for: pure functions (`calculate1RM`, `generateRandomHandle`, `buildEmptySets`)
- No dependencies needed

**Integration Tests:**
- Appropriate for: hooks (`useTetherState`, `useJointOps`) with Supabase mocked at the client level
- Requires: `@testing-library/react` `renderHook`

**E2E Tests:**
- Not applicable to current stage — no E2E framework installed or planned

---

*Testing analysis: 2026-04-22*
