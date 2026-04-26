# 🛡️ TETHER: MORNING AUDIT PROTOCOL

**AUTHOR:** TETHER_ARCHITECT
**EXECUTING AGENT:** Antigravity (Gemini) / Tether-Auditor
**TRIGGER:** Morning Review (Post-Night Build)

## 🎯 OBJECTIVES
Review the exact git diff of every file modified by Claude Code during the autonomous night build. The goal is to aggressively hunt for bad logic, lazy workarounds, or architectural deviations.

## 🕵️‍♂️ AUDIT CRITERIA
1. **Architectural Sanity:** Does the solution actually make sense? If the logic is stupid, overly complex, fragile, or completely on the wrong path, reject it.
2. **Zero-Lazy Policy:** Did Claude leave placeholders, half-baked implementations, or `// TODO` comments?
3. **Charter Compliance:** Is the anonymous data flow (Feu Follet Charter) respected, or did it try to collect unnecessary data?

## 🚨 ESCALATION PROTOCOL
If any code is flagged as "stupid", "bad logic", or "wrong path":
1. **HALT AUTOMATION:** Do NOT attempt to automatically fix it right then.
2. **LOG IT:** Append a section to `TETHER_BUILD_JOURNAL.md` titled `### ⚠️ AUDIT REJECTION`.
3. **TAG IT:** Explicitly tag the entry with `#OPUS_REVIEW` and `#HUMAN_INTERVENTION`.
4. **JUSTIFY IT:** Detail exactly *why* the logic failed the sanity check, pointing to specific line numbers, so the lead developer and Claude 3 Opus can dissect it in the morning.

## 🧠 SECOND_BRAIN EXTRACTION (NOTION SYNC)
After the audit is complete (pass or fail), you MUST generate a `SECOND_BRAIN` section in your final morning report. This must include:
- **Categorized Bullet Points:** (e.g., `[Auth]`, `[UI/3D]`, `[Expo Prep]`)
- **Quick Summaries:** High-level, non-technical translations of what was achieved or blocked.
- **Goal:** This output must be perfectly formatted so the user can literally copy-paste it directly into their Notion 2nd Brain to track their life/project progress.
