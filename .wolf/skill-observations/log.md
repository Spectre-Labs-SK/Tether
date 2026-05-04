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

### Observation 1: Cerebrum correction — metro.config.cjs required with "type":"module"

**Date:** 2026-05-03
**Session context:** CNG transition — git purge, metro refactor, expo-doctor verification
**Skill:** internal (OpenWolf cerebrum / project learning)
**Type:** internal
**Phase/Area:** Project setup / Metro configuration

**Issue:** Cerebrum entry stated "metro.config.js format: Use CommonJS even with type:module — Metro uses its own module loader." This was incorrect. With `"type": "module"` in package.json, Node treats `.js` files as ESM. Metro's `loadConfig` calls Node's `require()` on the file, which throws `ReferenceError: require is not defined`. Metro catches this, tries `import()`, which also fails (file uses `require`). Metro falls back to pure defaults — silently dropping all Expo transformer config including `_expoRelativeProjectRoot`, `babelTransformerPath` (expo's), and all CNG-related settings. expo-doctor reported the config as "not extending expo/metro-config" as a result.

**Suggested improvement:** Rename `metro.config.js` → `metro.config.cjs`. Metro's resolver explicitly searches for `.cjs` extension (confirmed in `metro-config/src/loadConfig.js` line 58: `SEARCH_JS_EXTS = [".js", ".cjs", ".mjs", ".json"]`). The `.cjs` extension forces CommonJS regardless of package.json `"type"` field.

**Principle:** Any CJS config file (metro.config, babel.config, patch-package postinstall scripts) in a project with `"type": "module"` must use the `.cjs` extension — not just "CommonJS syntax." Node's module type detection happens at the file system level, before the file is even evaluated. Metro's "own module loader" claim is false for config loading — it delegates to Node's standard `require()`. When in doubt, test with `require('./metro.config.js')` from a project-root test file.
