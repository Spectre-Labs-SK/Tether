#!/bin/bash
# SPECTRE LABS: GSD VALIDATION HOOK
PLAN_FILE=".planning/ROADMAP.md"
if ! grep -q "[ ]" "$PLAN_FILE"; then
  echo "❌ ERROR: No active task found in ROADMAP.md."
  echo "Execute /gsd-plan-phase before writing code."
  exit 1
fi
echo "✅ GSD Compliance Verified."