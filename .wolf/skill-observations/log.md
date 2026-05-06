# Skill Observation Log

> Maintained by the task-observer meta-skill. Each entry captures a pattern, correction, or workflow insight worth preserving as a reusable skill or skill improvement.
> Last reviewed: 2026-04-28

## Format

```
### OBS-NNN — [YYYY-MM-DD] Short title
**Status:** open | staged | resolved
**Type:** new-skill | skill-improvement | cross-cutting
**Target skill:** <skill name or "new">
**Visibility:** open-source | internal
**Observation:** What was observed.
**Recommendation:** What should change or be created.
**Evidence:** Session context, user correction, or example.
```

---

<!-- Observations are appended below this line -->

### Observation 2: npx skills add requires --yes for non-interactive installs

**Date:** 2026-05-05
**Session context:** Night Build — installing Impeccable design skill via `npx skills add pbakaus/impeccable`
**Skill:** internal (build workflow)
**Type:** internal
**Phase/Area:** Tool installation
**Status:** ACTIONED — principle applied to cerebrum.md (2026-05-05)

**Issue:** `npx skills add pbakaus/impeccable` is interactive by default — it prompts to select which agent runtimes to install to (Claude Code, Codex, Cursor, Gemini CLI, etc.). In an autonomous session this hangs waiting for keyboard input.

**Suggested improvement:** Always append `--yes` (or `-y`) when running `npx skills add` in autonomous builds. The tip is printed at the top of the CLI output: "use the --yes (-y) and --global (-g) flags to install without prompts."

**Principle:** Any `npx skills` invocation in an autonomous build must include `--yes`. The skills CLI is interactive by default. Pinning a specific version (`npx skills@1.5.3`) also avoids an extra npm install step and prevents version drift between runs.

### Observation 1: Cerebrum correction — metro.config.cjs required with "type":"module"

**Date:** 2026-05-03
**Session context:** CNG transition — git purge, metro refactor, expo-doctor verification
**Skill:** internal (OpenWolf cerebrum / project learning)
**Type:** internal
**Phase/Area:** Project setup / Metro configuration
**Status:** ACTIONED — fix applied to cerebrum.md and metro.config.cjs during CNG session (2026-05-03)

**Issue:** Cerebrum entry stated "metro.config.js format: Use CommonJS even with type:module — Metro uses its own module loader." This was incorrect. With `"type": "module"` in package.json, Node treats `.js` files as ESM. Metro's `loadConfig` calls Node's `require()` on the file, which throws `ReferenceError: require is not defined`. Metro catches this, tries `import()`, which also fails (file uses `require`). Metro falls back to pure defaults — silently dropping all Expo transformer config including `_expoRelativeProjectRoot`, `babelTransformerPath` (expo's), and all CNG-related settings. expo-doctor reported the config as "not extending expo/metro-config" as a result.

**Suggested improvement:** Rename `metro.config.js` → `metro.config.cjs`. Metro's resolver explicitly searches for `.cjs` extension (confirmed in `metro-config/src/loadConfig.js` line 58: `SEARCH_JS_EXTS = [".js", ".cjs", ".mjs", ".json"]`). The `.cjs` extension forces CommonJS regardless of package.json `"type"` field.

**Principle:** Any CJS config file (metro.config, babel.config, patch-package postinstall scripts) in a project with `"type": "module"` must use the `.cjs` extension — not just "CommonJS syntax." Node's module type detection happens at the file system level, before the file is even evaluated. Metro's "own module loader" claim is false for config loading — it delegates to Node's standard `require()`. When in doubt, test with `require('./metro.config.js')` from a project-root test file.

### Observation 3: New skill created — dev-profile-evolution

**Date:** 2026-05-05
**Session context:** gsd-new-project + gsd-profile-user session — user requested a self-improving profile skill
**Skill:** dev-profile-evolution (new)
**Type:** internal
**Phase/Area:** Skill creation
**Status:** OPEN

**Issue:** The gsd-profile-user skill is one-shot — it creates a profile but doesn't evolve it over time. As the developer's style shifts, the profile drifts from reality. There's no mechanism for the profile to update itself from ongoing session data, discover new behavioral dimensions, or propagate changes to all artifact locations.

**Suggested improvement:** Created `dev-profile-evolution` skill at `~/.claude/skills/dev-profile-evolution/SKILL.md`. It: (1) reads JSONL session files directly without gsd-sdk, (2) spawns gsd-user-profiler agent for behavioral analysis, (3) diffs and merges with recency weighting, (4) propagates to all 4 profile locations, (5) discovers emerging dimensions organically, (6) logs self-improvement observations back to task-observer. Task-observer weekly review should check if profile-last-run.txt is 7+ days old and trigger the skill if so.

**Principle:** Any skill that produces a static artifact (profile, codebase map, requirements doc) should have a paired evolution mechanism. One-shot generation plus periodic refresh is more valuable than a single comprehensive run that stales over time. The evolution skill should log observations about its own accuracy — that's the hook that lets task-observer make it better.
