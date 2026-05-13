---
name: start-day
description: Run the START DAY PROTOCOL — orient in repo, surface stale machinery, confirm focus
allowed-tools:
  - Read
  - Bash
  - Grep
  - Glob
  - Write
---

<objective>
Execute the START DAY PROTOCOL defined in CLAUDE.md. Read-only orientation
across .wolf/ machinery and git state, then surface a single Boot Report.
Do not auto-invoke any GSD command — present, then wait.

This is the mirror of END DAY PROTOCOL. Trigger phrases "Start Day" and
"Boot up" route here.
</objective>

<execution_context>
@C:/Users/Windows 11 Pro/Desktop/Spectre_Labs/Feu_Follet/Tether_Safe/CLAUDE.md
</execution_context>

<process>
Follow CLAUDE.md § START DAY PROTOCOL end-to-end.

1. Step 1 — Orient: read .wolf/cerebrum.md, tail of .wolf/memory.md,
   header of .wolf/anatomy.md, and run `git status -sb && git log -1 --oneline`.
2. Step 2 — Surface stale machinery: check .wolf/cron-state.json,
   .wolf/skill-observations/last-review-date.txt, OPEN observation
   counts in .wolf/skill-observations/log.md, and .wolf/buglog.json
   for any recent fixes touching files in the user's stated task.
3. Step 3 — Confirm focus: output the Boot Report block exactly as
   specified in CLAUDE.md.
4. Step 4 — Hand off: do NOT auto-invoke any GSD command. Suggest
   the appropriate slash command (e.g. /gsd:resume-work,
   /gsd:next, /gsd:health) only if the user's stated task warrants it.
5. Step 5 — Log the boot: append one line to .wolf/memory.md in the
   format `| HH:MM | Boot Report | — | <branch>/<flags count> | ~50 tok |`.

If the weekly skill review threshold (>=7 days since last review) is
breached, trigger the comprehensive review BEFORE proceeding with the
user's task — per CLAUDE.md task-observer guidance.
</process>
