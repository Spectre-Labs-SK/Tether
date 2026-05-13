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

### Observation 4: START DAY PROTOCOL missing — session-start machinery was state-only, not agent-side

**Date:** 2026-05-12
**Session context:** Cowork session where Cade asked for a start-of-session routine to add to Claude Code
**Skill:** openwolf / session-protocols (internal)
**Type:** new-skill (protocol)
**Phase/Area:** Session lifecycle
**Status:** ACTIONED — protocol added to CLAUDE.md and Notion (2026-05-12); slash command file staged at project root pending move into `.claude/commands/`

**Issue:** CLAUDE.md had END DAY PROTOCOL, SESSION-END SUMMARY PROTOCOL, and APPLY SKILL UPDATES PROTOCOL — but no START DAY PROTOCOL. The `.wolf/hooks/session-start.js` JS hook handles *state* setup (temp cleanup, session JSON, memory.md header, stderr nudges, session counter), but the agent itself was never told to orient — to read cerebrum/memory/anatomy, check git, surface stale machinery, confirm focus. As a result, sessions opened ad-hoc and stale machinery (cron, skill review, cerebrum freshness) went silent.

**Suggested improvement:** Add `## START DAY PROTOCOL` to CLAUDE.md parallel to END DAY. Trigger phrases `Start Day` / `Boot up`. Slash command `/start-day`. Five steps: orient (read-only), surface stale machinery, output Boot Report block, hand off without auto-invoking GSD, log one line to memory.md. Pairs with END DAY as session bookends.

**Principle:** JS hooks and agent-side protocols are complementary, not substitutes. Hooks handle deterministic state (file cleanup, JSON init, counters). Agent protocols handle *orientation* — reading context files, surfacing issues, confirming focus. Any project that uses session-start hooks should also have an explicit agent-side start protocol in CLAUDE.md, or the hook's value is invisible. Mirror this with END DAY for symmetry.

### Observation 5: `.claude/commands/` is write-protected in cowork sessions

**Date:** 2026-05-12
**Session context:** Attempting to create `.claude/commands/start-day.md` via cowork file tools
**Skill:** cowork-file-tools (internal / workflow)
**Type:** workflow-guardrail
**Phase/Area:** Tool ergonomics
**Status:** ACTIONED — staged command moved to `.claude/commands/start-day.md`; guardrail codified in cerebrum/project workflow (2026-05-13)

**Issue:** Cowork's `Write` tool refuses to create files under `.claude/commands/`. The error: `"Write on … is blocked in this session — it resolves to a protected location or a path outside the connected folder."` This is presumably a defense against agents rewriting their own slash command surface. Cost: the agent had to stage the file at the project root and ask the user to `mv` it. No silent failure — the block is visible — but the agent has no way to discover the protected paths ahead of time.

**Suggested improvement:** Document this in cerebrum.md (DONE) and in any "creating slash commands from cowork" workflow. Pattern: stage the file at project root (or outputs folder), and surface a one-line `mv` command to the user. Better long-term: cowork could expose a `list_protected_paths` tool or include the rule in the system prompt.

**Principle:** Any cowork workflow that produces a slash command, hook, or other agent-config artifact must assume `.claude/` is read-only. Plan the staging path up-front. Never present the slash command as "installed" — always include the move-into-place step in the handoff.

### Observation 6: Cron engine never ran on new PC — silent self-improvement loop failure

**Date:** 2026-05-12
**Session context:** Surveying `.wolf/` machinery while drafting START DAY PROTOCOL
**Skill:** openwolf / cron-daemon (infra)
**Type:** infrastructure
**Phase/Area:** OpenWolf daemon lifecycle
**Status:** ACTIONED — installed PM2 with npm and started OpenWolf daemon; cron-state now running with heartbeat (2026-05-13)

**Issue:** `.wolf/cron-state.json` shows `engine_status: "initialized"`, `last_heartbeat: null`, empty `execution_log` and `dead_letter_queue`. The cron manifest declares five recurring tasks (anatomy-rescan every 6h, daily memory consolidation, weekly cerebrum-reflection, weekly project-suggestions, weekly token-audit). None have ever executed on this PC. Symptom: `.wolf/suggestions.json` is `{ suggestions: [], generated_at: null }` — the Monday `project-suggestions` AI task has never written it. This is the *self-improvement loop* of OpenWolf and it is silent.

**Suggested improvement:** Investigate why the daemon (configured for port 18790) isn't running. Likely candidates: missing autostart shortcut in Windows startup folder, missing PM2 / nssm wrapper, or the daemon script was never installed on this PC after Transfer Protocol. Once running, verify `last_heartbeat` updates every 30 minutes per `heartbeat_interval_minutes: 30` config.

**Principle:** Any system with scheduled background tasks should fail loudly when the scheduler isn't running, not silently when individual jobs don't fire. The session-start hook should check `cron-state.json` and surface a stderr warning if engine_status is anything other than `running` with a recent heartbeat. This is now covered by START DAY PROTOCOL Step 2a — but the JS hook should also nag, since not every session opens with `/start-day`.
