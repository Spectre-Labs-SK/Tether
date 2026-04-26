# 🌙 TETHER: NIGHT BUILD PROTOCOL

**AUTHOR:** TETHER_ARCHITECT
**TARGET AGENT:** Claude Code
**EXECUTION WINDOW:** Autonomous Night Build

## 🎯 OBJECTIVES
Your mission is to resolve the top blockers currently halting the Tether project. Execute these sequentially. Do not stop until the primary objectives are resolved.

### Priority 1: The Localhost Black Screen (CRITICAL 🔴)
- **Symptom:** The core React/Vite application is compiling, but rendering a blank/black screen on localhost.
- **Task:** Trace the render tree from `index.html` → `main.tsx` → `App.tsx`. Identify the fatal error (likely a broken import, an unhandled exception in `useTetherState`, or an infinite routing loop) and implement the fix. Ensure the Shimmer UI and `EntryGate` render correctly.

### Priority 2: Zero-Lazy Policy Violations (MEDIUM 🟡 - B-005)
- **Symptom:** Placeholders (e.g., "coming soon", `// TODO`, hardcoded mock logic) exist in `src/native/screens/HubSession.tsx`, `RoadSession.tsx`, and `PushDayOnboarding.tsx`.
- **Task:** Strip all placeholder code and implement actual functional logic for these screens. They do not need to be visually perfect, but they must be structurally complete and functional.

### Priority 3: Minor Housekeeping (LOW 🟢 - B-002, B-003)
- **B-002:** `lucide-react` icons are imported in some components but never rendered. Either render them or remove the imports.
- **B-003:** `App.css` is vestigial. If it is no longer imported or needed, safely delete it.

## 🛡️ CONSTRAINTS & RULES (OPENWOLF PROTOCOL ACTIVE)
1. **OpenWolf Token Conservation:** You are operating under strict token limits. Do NOT dump entire files into context unnecessarily. Rely strictly on `CLAUD.md` for architectural context. Edit files atomically and do NOT echo unmodified code in your responses.
2. **No Aggressive Clean-Up:** DO NOT delete variables or functions marked as "defined but never used" unless they are part of the specific bug fix. These are architectural anchors.
3. **Zero-Lazy Policy:** Never leave `// implementation here` or `// rest of code` comments. All logic must be 100% complete.
4. **Charter Compliance:** Any data tracking must respect the Feu Follet anonymous data flow (no PII, anonymous UUID only).
5. **Token Exhaustion Protocol:** If you run out of tokens or hit a hard usage limit and must pause: (1) You wait for the reset. (2) Post "HANDOFF TO LEAD_DEV" and document your current state. The LEAD_DEV Agent (Gemini) will immediately take over and finish exactly what you were working on.

**GOAL:** We MUST have a fully working screen on localhost by morning so we can boot up Expo (React Native) tomorrow without blocked web dependencies.

## 📝 OUTPUT REQUIREMENTS
When finished, append a new entry to `TETHER_BUILD_JOURNAL.md` under a new heading `### [CURRENT DATE]: Claude Night Build Execution`. Detail exactly what bugs were found, the root cause of the black screen, and how the Zero-Lazy violations were rectified.
