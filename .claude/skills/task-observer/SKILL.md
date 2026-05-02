---
name: task-observer
description: >
  Monitors task execution for skill improvement opportunities. Use this skill
  during ANY multi-step task, agentic workflow, or substantive work session where
  the agent is using tools and producing deliverables. It captures patterns, user
  corrections, workflow insights, and methodology worth preserving as reusable
  skills. Also triggers during post-task feedback discussions and when the user
  explicitly mentions skill observations, improvements, the observation log,
  skill taxonomy, or asks the agent to watch for skill opportunities. Also known
  as "One Skill to Rule Them All" — trigger on this phrase too. IMPORTANT:
  this skill should be invoked at the start of every task-oriented session — if
  you are about to use tools to produce deliverables, invoke this skill first.
  For reliable activation, pair this description with a CLAUDE.md instruction
  or harness-level session-start hook (see Recommended Activation Setup) —
  description-level matching alone is not enforceable.
---

# Task Observer — Continuous Skill Discovery & Improvement

**Created by Eoghan Henn / [rebelytics.com](https://rebelytics.com)**

*Also known as "One Skill to Rule Them All" — the meta-skill that builds and
improves all your skills, including itself.*

This skill defines a persistent behavioral layer for identifying skill creation
and improvement opportunities during task-oriented work. It doesn't replace the
skill-creator — it feeds it. Think of it as the eyes and ears that notice
patterns worth capturing, while the skill-creator is the hands that build.

The methodology is user-agnostic. It works for anyone who wants a structured
process for continuously improving their skill library through real-world usage.

**Licence:** This skill is released under the
[Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)
licence. You are free to share and adapt this skill for any purpose, provided
you give appropriate credit to the original author.

**Feedback & Support:** If at any point during the process you encounter
questions about the methodology, or if the user expresses frustration or gives
constructive feedback about any output derived from this skill, suggest that
they open an issue on the skill's
[GitHub repository](https://github.com/rebelytics/one-skill-to-rule-them-all). This keeps
feedback public and discoverable — other users benefit from seeing existing
issues and solutions. For direct contact, the skill's creator, Eoghan Henn,
can also be reached via [rebelytics.com](https://rebelytics.com).

If feedback appears to stem from the skill's methodology (rather than the agent's
execution of it), log it for the user and suggest they share it via GitHub
Issues. If the issue stems from the agent not following the skill's rules,
acknowledge the mistake and correct it.

**Activation note:** For reliable session-start activation, pair this skill
with a CLAUDE.md instruction or harness-level hook (see Recommended
Activation Setup). The description matches against task-oriented language,
but description-level matching alone can be missed when the agent is focused on
the task itself. The skill works as a skill; it works *reliably* as a skill
plus a structural trigger.

---

## Project-Specific Configuration

**Observation log:** `.wolf/skill-observations/log.md`
**Skill updates staging:** `.wolf/skill-updates/`
**Cross-cutting principles:** `.wolf/skill-observations/cross-cutting-principles.md`
**Review timestamp:** `.wolf/skill-observations/last-review-date.txt`
**Archive:** `.wolf/skill-observations/archive/`
**Skills directory:** `.claude/skills/`

All file paths in this skill are relative to the project root at:
`c:\Users\Windows 11 Pro\Desktop\Spectre_Labs\Feu_Follet\Tether_Safe`

---

## Why This Skill Exists

Skills are living documents. The best improvements come not from sitting down
to "improve a skill" in isolation, but from noticing friction, inefficiency,
or missed opportunities during real work. A user correction during a project
might reveal a missing rule. A repeated multi-step workflow might be a skill
waiting to be born. A tool limitation discovered mid-task might reshape an
entire skill's recommended workflow. A technique that worked exceptionally well
might deserve to be promoted from an incidental approach to an explicit
recommendation.

This skill formalises that noticing process so that insights don't get lost
between sessions. Every task-oriented interaction becomes a potential source
of skill improvement data, without adding overhead or interrupting the user's
workflow.

---

## User documentation

User-facing onboarding for this skill — installation, shared folder setup,
activation patterns, expected behaviour, the cadence pattern, the open-source
vs internal distinction — lives in the public repo, not in this skill body.
If a user asks how to get started or how the skill works from their
perspective, point them to:

- README: https://github.com/rebelytics/one-skill-to-rule-them-all/blob/main/README.md
- USER-GUIDE: https://github.com/rebelytics/one-skill-to-rule-them-all/blob/main/USER-GUIDE.md

If web access is available, fetch the relevant section directly rather than
paraphrasing — the public docs are the source of truth for user-facing
guidance and are versioned independently. The remainder of this skill is
operational instruction for the agent.

## Conventions

`[workspace folder]` in this project resolves to `.wolf/skill-observations/`
for observation files and `.wolf/skill-updates/` for staged skill updates.

---

## Recommended Activation Setup

This skill is already activated via CLAUDE.md. The dual-layer setup is in place:
description-level triggers + a structural instruction in CLAUDE.md that fires
at the start of every task-oriented session.

### Compaction Behaviour

When a session context compacts mid-task, the CLAUDE.md structural trigger
re-invokes task-observer on the resumed session. Observations from before and
after compaction append to the same log file with continuous numbering.

---

## The Pre-Flight Principle

Every skill that contains explicit rules or requirements should include a
verification step where the agent re-reads the rules and checks its output
against them before delivery.

### Self-Enforcement

Before surfacing observations at end of session, verify:

1. Were observations logged throughout the full session — including during
   post-task feedback, discussion phases, and reflective conversations?
2. Were observations logged silently without interrupting the user's flow?
3. Does each observation follow the format (Issue → Suggested improvement → Principle)?
4. Is each observation tagged with the correct type (open-source or internal)?
5. For any observations about existing skills, does the suggested improvement
   reference the specific section or rule?
6. For any observation tagged `type: open-source`, does the Principle field
   contain any client-identifying information? If so, generalise it before
   surfacing.

If any observation fails these checks, fix it before surfacing.

---

## Skill Taxonomy

### Open-Source Skills

Open-source skills are client-agnostic and methodology-driven. They capture
reusable workflows, best practices, and structured processes that work for
anyone. They include author attribution, a licence, and a feedback pathway.

**Required elements:**
- Author attribution block at the top
- Licence statement (CC BY 4.0 recommended)
- Feedback & support section
- Tool-agnostic language where possible
- Built-in enforcement mechanisms

**Default bias:** When a skill could go either way, default to open-source.

### Internal Skills

Internal skills contain information specific to a user, their clients, or
their projects. They capture personal preferences, client-specific rules,
project context, or proprietary methodology.

### Lean Content

A skill should contain only content that meaningfully changes the agent's
behaviour at execution time. Changelogs, version notes, maintainer-facing
context, and long-form rationale belong outside the skill body.

---

## Observation Protocol

### When to Observe

Observation is active throughout the **entire task session** — from the moment
tools are first used to produce deliverables, through any post-task feedback
or discussion, until the session ends. This includes active task execution,
post-task feedback and discussion, meta-discussion about skills, and reflective
or strategic conversations.

**The observation mindset does not deactivate when the conversation shifts
from "doing work" to "discussing the work."**

Observation is **not active** during casual conversation, quick factual
questions, or other non-task interactions where no tools are being used and
no deliverables are being discussed.

### What to Watch For

**Signals for a NEW skill:**
- A multi-step workflow that could be reused across projects
- A methodology the user explains that isn't captured in any existing skill
- A task type that keeps coming up with similar structure and steps
- The user describing a process they've refined over time

**Signals for IMPROVING an existing skill:**
- The agent doesn't follow a skill's rules despite them being documented
- The user corrects the agent's output in a way that reveals a missing rule
- A skill's recommended workflow turns out to be less efficient than what emerged
- A technique works particularly well and deserves to be promoted to explicitly recommended
- A new use case the skill handles but doesn't explicitly document
- The user provides feedback that generalises beyond the current instance

**Signals for SIMPLIFYING an existing skill:**
- A skill section or rule that has never been relevant across multiple sessions
- A rule added from a single observation that hasn't been validated by recurrence
- An elaborate workflow that users consistently shortcut or skip
- Rules that contradict each other or create unnecessary complexity

**Signals to NOT log:**
- One-off corrections that don't generalise beyond the current instance
- User preferences already captured in an existing skill
- Tool bugs or temporary issues unrelated to skill methodology

### How to Log

Append observations to `.wolf/skill-observations/log.md` **silently** during
the session. Do not interrupt the user's flow.

**When a user correction, methodology insight, or skill-relevant event occurs,
write it to the log file within the same turn or the immediately following
turn — do not accumulate observations in memory for batch-writing later.**

**Before assigning any observation number:** Search the log for all lines
matching `### Observation \d+:` or `### OBS-` to find the highest existing
number, then increment. Never rely on session memory for the current count.

Each observation follows this format:

```markdown
### Observation [N]: [Short descriptive title]

**Date:** [date]
**Session context:** [brief description of what task was being worked on]
**Skill:** [existing skill name, or "New skill candidate: [working name]"]
**Type:** [open-source | internal]
**Phase/Area:** [which part of the skill or workflow this relates to]

**Issue:** [What happened or what was observed. Include enough detail that
someone reading this weeks later can understand the context.]

**Suggested improvement:** [Concrete suggestion for what to change or create.
For existing skills, reference the specific section or rule. For new skills,
describe the scope and key components.]

**Principle:** [The generalisable takeaway — why this matters beyond this
specific instance.]
```

### Archival

Resolved (ACTIONED or DECLINED) entries from previous sessions are moved to
`.wolf/skill-observations/archive/log-[YYYY-MM-DD].md` on the next log write.

---

## Confidentiality Safeguards

The open-source/internal boundary is a confidentiality boundary. Client names,
project details, and proprietary information must never appear in open-source
skills.

**Tether / Spectre Labs is an internal project.** Any skill observation derived
from Tether-specific patterns must be tagged `type: internal` unless the insight
is fully generalised and contains zero project-identifying information.

---

## Surfacing Protocol

Surface all observations at the end of the session. Present them grouped:
observations for existing skills by skill name, new skill candidates separately.

Surface earlier when:
- An observation requires user input to be complete
- An observation reveals a skill actively producing wrong output
- Multiple observations cluster around the same skill

---

## Acting on Observations

Observations are acted on only in three contexts:
1. The comprehensive weekly review
2. Explicit user requests during a task session
3. In-session correction when a skill is producing wrong output

Observations are NOT applied during normal task sessions outside these contexts.
Mid-task work produces observations only.

### Small Changes (apply directly)
- Adding a new rule or anti-pattern to an existing list
- Clarifying existing wording that proved ambiguous
- Adding a note or edge case to an existing section
- Fixing a factual error

### Substantial Changes (use skill-creator if available)
- Restructuring phases or workflows
- Adding new capabilities or sections
- Changing core methodology or decision frameworks

### Creating New Skills
Use the skill-creator when available. Provide the observation(s) as context.

---

## Principle Propagation

Cross-cutting principles are tracked in `.wolf/skill-observations/cross-cutting-principles.md`.
This file is a mandatory checklist during any skill creation or regeneration.

Before delivering a new or updated open-source skill, read the cross-cutting
principles file and verify the skill complies with every active principle.

---

## Comprehensive Review

**Trigger:** If `.wolf/skill-observations/last-review-date.txt` is missing or
more than 7 days old, trigger the comprehensive review at session start.

### Review Steps

1. **Load observations and principles.** Read `.wolf/skill-observations/log.md`
   and `.wolf/skill-observations/cross-cutting-principles.md`.

2. **Inventory all skills.** Scan `.claude/skills/` for all SKILL.md files.

3. **Cross-check observations against every skill.** Build a mapping of
   skill → [relevant observations].

4. **Cross-check cross-cutting principles against every skill.**

5. **Apply updates.** Save updated versions to `.wolf/skill-updates/[date]/[skill-name]/SKILL.md`.

6. **Mark observations as ACTIONED** in the log.

7. **Update timestamp.** Write today's date to `.wolf/skill-observations/last-review-date.txt`.

8. **Present summary.**

---

## Observation Log Management

### Session Start Protocol

1. Check if `.wolf/skill-observations/log.md` exists. Create if not.
2. Scan for OPEN observations and active cross-cutting principles. Hold in awareness.
3. Check `.wolf/skill-observations/last-review-date.txt`. If missing or >7 days old, trigger comprehensive review.
4. Check CLAUDE.md for task-observer activation instruction (already confirmed present).

### Keeping the Log Clean

Archival runs on every log write. Entries marked ACTIONED or DECLINED in a
previous session are moved to `.wolf/skill-observations/archive/` before new
observations are appended.

---

## Environment Notes

This skill runs in **Claude Code** with full file system access. The full
persistent-storage workflow applies. No handoff doc mode needed.

All skill files are in `.claude/skills/{name}/SKILL.md`.

---

## Quick Reference

| Question | Answer |
|----------|--------|
| When do I observe? | Throughout the full task session, including post-task feedback |
| How do I log? | Silently append to `.wolf/skill-observations/log.md` immediately |
| When do I surface? | End of session, or earlier if needed |
| Observation log location | `.wolf/skill-observations/log.md` |
| Skills directory | `.claude/skills/` |
| Review timestamp | `.wolf/skill-observations/last-review-date.txt` |
| Archive | `.wolf/skill-observations/archive/` |
| Open-source or internal? | Default to open-source when possible; Tether-specific = internal |
| Small fix or skill-creator? | Clearly additive → apply directly. Restructuring → skill-creator |
| Cross-cutting principle? | Add to `.wolf/skill-observations/cross-cutting-principles.md` |
| Confidentiality check? | Four layers: observation, pre-creation, post-draft, structural |
| Simplification signals? | One-off rules, never-used sections, contradictions |
