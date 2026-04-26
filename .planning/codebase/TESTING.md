# Testing

**Last Mapped:** 2026-04-25

## Framework

**None.** No test framework is installed or configured.

- No Jest, Vitest, Mocha, or Playwright in `package.json`
- No `test` script in `package.json`
- No `jest.config.js`, `vitest.config.ts`, or `playwright.config.ts`

## Test Files

Zero test files exist in `src/`. All `.test.*` / `.spec.*` files found are inside `node_modules/` (library tests from meshoptimizer, zod, tunnel-rat, etc.).

## Coverage

**0%** — no automated test coverage of any kind.

## What Exists Instead

- `calculate1RM()` in `PushDayOnboarding.tsx` is a pure function with deterministic math (Epley + Brzycki + Lander) — testable but untested
- `useTetherState` business logic (`bitchweights`, `trickycardio`) is pure enough to unit test but has no tests
- OpenWolf cerebrum / buglog provide informal regression knowledge across sessions

## Key Gaps

| Area | Risk | Notes |
|---|---|---|
| `calculate1RM` pure function | Medium | 3 formula consensus — easy to unit test |
| `useTetherState.bitchweights()` | High | 6-week 1RM delta logic; no test coverage |
| `useTetherState.trickycardio()` | High | HR gating logic; no test coverage |
| Supabase integration | High | No mock or integration tests |
| EntryGate auth flow | Medium | Anonymous sign-in + kill switch — no E2E test |
| `brzycki()` edge case | Medium | `reps >= 37` guard returns 0 — untested |

## Running Tests

```bash
# No test command available
npm run lint   # ESLint only — static analysis, not runtime tests
npm run build  # Type-check via tsc -b
```

## Recommendations

Priority order for adding tests:
1. **Vitest** — zero config overhead (already uses Vite)
2. Unit test `calculate1RM`, `bitchweights` math, `trickycardio` logic first
3. Integration test Supabase operations via Supabase local dev + test project
