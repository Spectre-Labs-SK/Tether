# Tether Agent Protocol

## Roles

- **Cade:** product governor and final decision maker.
- **Notion:** product memory and intent source.
- **Repo:** executable implementation source.
- **Compiler/tests:** implementation auditor.
- **Codex/Claude:** coding and architecture partners.

No legacy governor workflow is active. No local lead-dev fallback is assumed.

## Current Product Direction

Tether is an AI-first household executive function system. Fitness is not a hardcoded workout selector. The app should learn from behavior from first download, ask at most 3 high-yield questions, then draft and adapt plans with skip, substitute, shuffle, defer, and user-correction controls.

Themes, hidden themes, the Bunker, groceries, finances, envelopes, debt snowball, pantry velocity, and automation are core product systems. They should be treated as first-class architecture, not side notes.

## Engineering Guardrails

- Keep product logic aligned with Feu Follet: user control, data minimization, kill switch, and real wipe flows.
- Route AI calls through Supabase Edge Functions only. Never expose AI API keys in the client bundle.
- Do not move money or connect directly to bank accounts unless Cade explicitly changes that product law. Tether gives instructions; the user acts.
- Do not build new hardcoded workout plans as the foundation.
- When old docs conflict with Cade's current direction, update the docs before building from them.
