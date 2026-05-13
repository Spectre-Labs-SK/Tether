# Phase 0 Data Model

This contract keeps Level 0 Bunker Reconstruction honest: behavior is logged
from the first interaction, generated plans remain adaptable, and finance signal
comes from screenshots or manual confirmation only.

## Trust Boundaries

- No direct bank access.
- No automated money movement.
- Wipe data means full deletion, not archive.
- Screenshot ingestion stores metadata and storage paths before any parsing.
- Partner sharing is explicit and limited to Joint Ops/Ghost Ops context.

## Core Tables

### behavior_events

Append-only user behavior stream for the Bunker, fitness actions, trust actions,
and chaos responses.

Key fields:

- `profile_id`
- `event_family`
- `event_type`
- `source`
- `context`
- `metadata`
- `occurred_at`

Required event types include `complete`, `skip`, `substitute`, `shuffle`,
`defer`, `correction`, `chaos_response`, `partner_response`, `wipe_requested`,
`wipe_completed`, and `kill_switch_checked`.

### question_sessions

One planning attempt can ask at most three high-yield questions before drafting
an action.

Key fields:

- `profile_id`
- `plan_id`
- `purpose`
- `questions`
- `answers`
- `question_count`
- `status`

### generated_plans

Stores what Tether drafted, whether from AI later or deterministic local
drafting in Phase 0.

Key fields:

- `profile_id`
- `joint_op_id`
- `source`
- `title`
- `mode`
- `status`
- `draft_context`

### plan_steps

Ordered action steps inside a generated plan.

Key fields:

- `plan_id`
- `step_order`
- `domain`
- `title`
- `instructions`
- `status`
- `alternate`

### plan_actions

Records what the user did with a plan or step.

Key fields:

- `plan_id`
- `step_id`
- `profile_id`
- `action_type`
- `note`
- `metadata`

Required action types include `complete`, `skip`, `substitute`, `shuffle`,
`defer`, `correction`, and `partner_response`.

### screenshot_ingestions

Storage-first screenshot pipeline. Phase 0 stores the upload record, not parsed
financial truth.

Key fields:

- `profile_id`
- `storage_path`
- `source`
- `status`
- `metadata`
- `uploaded_at`

### accounts

Screenshot-inferred or manually confirmed account records. They are not live
bank connections.

### transactions

Screenshot-inferred or manually entered transaction records. They never trigger
money movement.

### envelopes

User-approved planning buckets for future finance support.

### pantry_items

Manual or receipt-derived pantry records for later velocity learning.

### pendulum_events

Future non-clinical pattern warning records. Phase 0 only prepares the behavior
spine needed for later review.

### noseyquestions_log

Low-frequency question history so Tether can avoid repetitive or poorly timed
questions.

## Wipe Data Contract

Wipe data deletes user-owned records across Phase 0 tables. It is not an
archive flow and should not retain deleted user data as a hidden audit trail.

## Kill Switch Contract

The kill switch is a hard product law check. Phase 0 records the contract and
stub state; future firing logic must wipe server data if ads run, in-app goods
are sold, or user data is shared with third parties.
