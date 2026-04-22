#!/bin/bash
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
echo "OPERATIVE ENTRY:"
read ENTRY
echo -e "\n### [$TIMESTAMP]\n**Status:** $ENTRY" >> TETHER_BUILD_JOURNAL.md
echo ">> Entry synced to TETHER_BUILD_JOURNAL.md"
grep -r "manual_override: true" ./src/native/screens/ && echo "⚠️ WARNING: BYPASS LOGIC DETECTED"