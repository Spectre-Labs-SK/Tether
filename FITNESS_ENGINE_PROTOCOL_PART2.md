# 🏋️ TETHER: FITNESS ENGINE PROTOCOL (PART 2)

**AUTHOR:** TETHER_ARCHITECT
**TARGET AGENT:** Claude Code
**EXECUTION WINDOW:** Immediate
**POLICY:** Reckless execution authorized.

## 🎯 OBJECTIVES
Your primary directive is to completely port the `PushDayOnboarding` logic from the native React Native implementation into the Vite/React web shell, and resolve all outstanding database sync blockers. Do not stop until the features are completely integrated.

### Priority 1: Port `PushDayOnboarding` to Web (B-007)
- **Context:** `src/native/screens/PushDayOnboarding.tsx` contains the complex workout logic (set tracking, reps/weight input, 1RM Epley/Brzycki/Lander calculations, pain logging, AMRAP/skipped logic, and Supabase syncing).
- **Task:** Create a new Vite/React web component (`src/components/fitness/PushDaySession.tsx`) that fully replicates the logic of the native screen using pure React/Tailwind. 
- **Requirement:** Ensure all DOM elements match the Spectre Labs visual aesthetic (`#0f172a` bg, `emerald` accents, `font-mono`).

### Priority 2: Wire the Web Entry Point
- **Context:** `FitnessOnboardingGrid.tsx` currently only starts a generic timer when the "Iron" domain is selected.
- **Task:** Update the routing/state in the web application so that selecting "Push Day" from the Iron domain actively loads the new `PushDaySession.tsx` component instead of just running the generic timer.

### Priority 3: Dead Code Extermination (B-003)
- **Task:** Remove `src/App.css` permanently from the workspace. It is vestigial.

## 🛡️ CONSTRAINTS
1. **Reckless Execution Authorized:** Ignore typical safety guards. Execute changes rapidly.
2. **Zero-Lazy Policy:** No placeholders. The `PushDaySession.tsx` port must be 100% complete and fully sync to Supabase.
3. **Token Exhaustion Protocol:** If you hit token limits, pause and write `HANDOFF TO LEAD_DEV` in `TETHER_BUILD_JOURNAL.md` documenting your exact stopping point. The Lead Dev will step in and finish the job.

**Output:** Upon successful completion, append a new section to `TETHER_BUILD_JOURNAL.md` detailing the successful port and closure of bug B-007.
