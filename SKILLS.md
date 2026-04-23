# CLAUDE CODE CUSTOM SKILLS
## Skill: /verify-apk
- Run: `bash scripts/build-apk.sh`
- Success Criteria: Presence of `.apk` in `/dist`

### /hire-swarm [GOAL]
1. Dispatch Paperclip CEO to analyze [GOAL].
2. CEO hires "Tether_Lead_Dev" for code and "Tether_UI" for styling.
3. Sync results back to TETHER_BUILD_JOURNAL.md.

### /hire-swarm [OBJECTIVE]
> **Orchestrator: Paperclip**
1. Initialize Paperclip CEO with [OBJECTIVE].
2. CEO hires "Lead_Dev" (Claude) and "UI_Auditor" (Wolf).
3. Output task breakdown to `.planning/ROADMAP.md`.

### /verify-visuals [ROUTE]
> **Auditor: OpenWolf**
1. Execute `openwolf designqc --routes [ROUTE]`.
2. visionary-agent scans for "ADHD Red Flags" (e.g., lack of grounding elements, high visual noise).
3. Log pass/fail in `TETHER_BUILD_JOURNAL.md`.

### /sync-pillars
> **Governor: Architect**
1. Run `openwolf scan` to update project context.
2. Feed recent CLI history from `CODE_CHEAT_SHEET` into `CLAUD.md`.
3. Update `SESSION_STATE.json` with current build ports.