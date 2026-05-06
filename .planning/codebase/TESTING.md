# Testing

**Last mapped:** 2026-05-05

## Framework

**Test runner:** None installed. No Jest, Vitest, or any other test runner is present in `package.json` (neither `dependencies` nor `devDependencies`).

**Assertion library:** None.

**Test config files:** None (`jest.config.*`, `vitest.config.*` — not present).

The project has zero test infrastructure at this time.

---

## Test Location

**Test files in `src/`:** None.

A glob for `**/*.test.*` and `**/*.spec.*` within `src/` returns no results. All `__tests__/` directories found in the repo are inside `node_modules/` (third-party packages only).

---

## Coverage

**Enforced coverage:** None. No coverage thresholds, no coverage tooling.

**Currently tested:** Nothing. Zero application code is covered by automated tests.

---

## Patterns

**No established patterns.** There are no mocking conventions, test data factories, or fixture strategies to document because no tests exist.

---

## Running Tests

No test commands are defined in `package.json`. The `scripts` block contains only:

```bash
npm run dev        # Vite dev server
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run preview    # Vite preview
```

There is no `test` or `test:watch` script.

---

## Gaps

**Everything is untested.** The full application surface has zero automated coverage:

| Area | Files | Risk |
|---|---|---|
| Auth flow (anon → permanent) | `src/components/EntryGate.tsx`, `src/lib/supabase.ts` | High — silent failures at auth boundary affect all users |
| Profile state machine | `src/hooks/useTetherState.ts` | High — crisis_mode/onboarding_pending state machine has no regression tests |
| Joint ops CRUD | `src/hooks/useJointOps.ts` | High — all Supabase mutations untested |
| Armory gates (bitchweights, trickycardio) | `src/hooks/useArmory.ts` | High — gate logic is business-critical; wrong bpm math blocks users |
| Synthesis logic | `src/logic/synthesis/nightlySynth.ts`, `src/logic/synthesis/DailyPlanSchema.ts` | High — pure TS, highly testable, completely uncovered |
| Pattern observer priority logic | `src/hooks/usePatternObserver.ts` | Medium — 7-priority switch; priority ordering bugs would be invisible |
| Zustand store | `src/stores/patternStore.ts` | Low — simple merge store, but `setTarget` partial-merge behavior is untested |
| Native screens | `src/native/screens/*.tsx` | Medium — timer logic, interval progression, session persistence are untested |

**Highest-priority testing candidates** (pure TS, no DOM/RN dependency):

1. `src/logic/synthesis/nightlySynth.ts` — `synthesizeDay()` is pure async logic that can be tested with mocked Supabase responses. The `DailyPlanEvent.alternate` non-nullable invariant is especially important to guard.
2. `src/hooks/useArmory.ts` — `bitchweights()` and `trickycardio()` contain arithmetic business logic (1RM delta %, cardio gate minutes) that is ideal for unit tests.
3. `src/hooks/usePatternObserver.ts` — priority-ordered ShimmerTarget selection logic can be validated with simple input→output assertions without React.

---

## Recommended Setup (when tests are introduced)

**Suggested runner:** Vitest (aligns with Vite build chain already in use).

```bash
npm install -D vitest @vitest/ui
```

**Add to `package.json` scripts:**
```bash
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest --coverage"
```

**Suggested file placement:** Co-locate with source using `.test.ts` suffix:
- `src/logic/synthesis/nightlySynth.test.ts`
- `src/hooks/useArmory.test.ts`

**Supabase mocking:** Use `vi.mock('../../lib/supabase')` to stub the Supabase client. The client is a named export from `src/lib/supabase.ts` — straightforward to intercept.

**Hook testing:** Use `@testing-library/react` with `renderHook` for hooks that depend on React lifecycle. Pure-logic functions extracted from hooks (like `toTetherState()` in `useTetherState.ts`) can be imported and tested directly without React.

---

*Testing analysis: 2026-05-05*
