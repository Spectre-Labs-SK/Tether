# Cross-Cutting Principles

> Principles that apply across the entire skill library — not specific to any one skill.
> Maintained by the task-observer meta-skill.
> Last updated: 2026-04-28

## Principles

<!-- Cross-cutting principles are appended below this line -->

- Every skill with rules should have a mechanism to enforce them (not just state them).
- Skills should be parameterized for the actual project (real file paths, real conventions) not generic placeholders.
- Internal skills must never leak confidential data into open-source skills — tag all observations with visibility before staging.
- Skill triggers should be specific enough to avoid false positives but broad enough to catch the intended use cases.
