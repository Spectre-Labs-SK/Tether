# Tether ML Architecture — Phase 0 Source Spec

**Status:** Phase 0 planning input. This defines the first intelligence layer
contracts before advanced ML exists.

## Core Principle

The intelligence layer starts from first download. Phase 0 does not need a
trained model, but it must create the event stream and storage contracts that a
future model can learn from.

Tether should infer cautiously, ask at most three high-yield questions, and offer
a door rather than a diagnosis.

## What Phase 0 Builds

Phase 0 builds the data spine, not full ML:

- Behavior event logging from the first interaction.
- Question session records for every high-yield question asked.
- Generated plan records for AI-drafted or rule-drafted plans.
- Plan step records with user actions.
- Screenshot ingestion records where images are uploaded and stored, not parsed.
- Memory retrieval direction using Supabase plus pgvector for later
  personalization.

## Screenshot-Only Finance Model

Finance signal comes from screenshots and receipts. There is no bank-account
access and no automated money movement.

Phase 0 should support:

- Image upload metadata.
- Consent framing.
- Storage references.
- Parsing status fields.
- Manual user confirmation later.

Phase 0 should not support:

- Plaid or open banking.
- Direct account access.
- Automated transfers.
- Any instruction that moves money without the user acting.

## Behavior Event Stream

The event stream is the most important Phase 0 artifact. It should capture
honest user behavior without shame language.

Required event families:

- Task action: complete, skip, substitute, shuffle, defer.
- User correction: wrong assumption, bad timing, wrong difficulty, wrong plan.
- Chaos response: accepted, defended, ignored, deferred, recovered.
- Question answer: asked, answered, skipped.
- Plan action: accepted, changed, rejected, completed.
- Trust action: wipe requested, wipe completed, kill switch checked.

## Cautious Inference Rules

Phase 0 inference must be conservative:

- Prefer "we noticed a pattern" over claims of certainty.
- Never diagnose.
- Never shame spending, food, sleep, or skipped actions.
- Ask only when the answer materially improves the next plan.
- Treat silence, skipping, and substitution as useful signals.
- Keep partner disclosure explicit; do not automatically share sensitive
  warnings.

## pgvector Direction

Supabase plus pgvector is approved as the long-term memory retrieval spine.

Phase 0 should leave room for embeddings over:

- Plan steps.
- User corrections.
- Repeated substitutions.
- Timing patterns.
- Household chaos events.
- Screenshot-derived transaction summaries after parsing exists.

Embeddings do not need to ship in the first slice unless they directly support a
Phase 0 acceptance criterion.

## Pendulum Warning Direction

Pendulum warnings are the eventual core value: seeing the pattern before the
user consciously notices.

Phase 0 only prepares for this by logging baseline behavior. Warning copy stays
non-clinical:

- Good: "Hey. We noticed something. You okay?"
- Good: "Want a smaller plan today?"
- Bad: "We think you're cycling."
- Bad: "You're overspending."

Clinical language review is required before mental-health-adjacent warnings ship
as user-facing product.

## Acceptance Test

After Phase 0, every meaningful user action in the Bunker/Fitness slice should
produce a behavior record that can later answer:

- What did the system suggest?
- What did the user do instead?
- What changed in the Bunker?
- What should Tether learn for next time?
