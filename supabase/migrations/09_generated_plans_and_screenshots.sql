-- Tether | Spectre Labs
-- Migration 09: Generated plans, plan actions, and screenshot ingestion
-- Screenshot ingestion stores metadata and storage paths only. No bank access.

CREATE TABLE IF NOT EXISTS generated_plans (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joint_op_id   UUID        DEFAULT NULL REFERENCES joint_ops(id) ON DELETE SET NULL,
  source        TEXT        NOT NULL DEFAULT 'local_draft' CHECK (source IN ('local_draft', 'ai_draft', 'user_seeded')),
  title         TEXT        NOT NULL,
  mode          TEXT        NOT NULL DEFAULT 'ghost_ops' CHECK (mode IN ('joint_ops', 'ghost_ops', 'solo')),
  status        TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'complete', 'deferred', 'abandoned')),
  draft_context JSONB       NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS generated_plans_profile_time
  ON generated_plans (profile_id, created_at DESC);

CREATE TABLE IF NOT EXISTS plan_steps (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id      UUID        NOT NULL REFERENCES generated_plans(id) ON DELETE CASCADE,
  step_order   INTEGER     NOT NULL CHECK (step_order > 0),
  domain       TEXT        NOT NULL DEFAULT 'fitness',
  title        TEXT        NOT NULL,
  instructions TEXT        NOT NULL DEFAULT '',
  status       TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'complete', 'skipped', 'substituted', 'deferred')),
  alternate    JSONB       NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (plan_id, step_order)
);

CREATE TABLE IF NOT EXISTS plan_actions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id     UUID        NOT NULL REFERENCES generated_plans(id) ON DELETE CASCADE,
  step_id     UUID        DEFAULT NULL REFERENCES plan_steps(id) ON DELETE SET NULL,
  profile_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT        NOT NULL CHECK (action_type IN (
    'complete',
    'skip',
    'substitute',
    'shuffle',
    'defer',
    'correction',
    'partner_response'
  )),
  note        TEXT        DEFAULT NULL,
  metadata    JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS plan_actions_profile_time
  ON plan_actions (profile_id, created_at DESC);

CREATE TABLE IF NOT EXISTS screenshot_ingestions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  storage_path TEXT        NOT NULL,
  source       TEXT        NOT NULL DEFAULT 'manual_upload' CHECK (source IN ('manual_upload', 'receipt', 'finance_screenshot')),
  status       TEXT        NOT NULL DEFAULT 'stored' CHECK (status IN ('stored', 'queued', 'parsed', 'confirmed', 'rejected')),
  metadata     JSONB       NOT NULL DEFAULT '{}',
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS screenshot_ingestions_profile_time
  ON screenshot_ingestions (profile_id, uploaded_at DESC);

CREATE TABLE IF NOT EXISTS accounts (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id         UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  screenshot_id      UUID        DEFAULT NULL REFERENCES screenshot_ingestions(id) ON DELETE SET NULL,
  label              TEXT        NOT NULL,
  account_kind       TEXT        NOT NULL DEFAULT 'unknown',
  last_four          TEXT        DEFAULT NULL,
  inferred_balance_cents INTEGER DEFAULT NULL,
  user_confirmed     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_id     UUID        DEFAULT NULL REFERENCES accounts(id) ON DELETE SET NULL,
  screenshot_id  UUID        DEFAULT NULL REFERENCES screenshot_ingestions(id) ON DELETE SET NULL,
  label          TEXT        NOT NULL,
  amount_cents   INTEGER     NOT NULL,
  occurred_on    DATE        DEFAULT NULL,
  user_confirmed BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS envelopes (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label          TEXT        NOT NULL,
  target_cents   INTEGER     NOT NULL DEFAULT 0,
  current_cents  INTEGER     NOT NULL DEFAULT 0,
  user_approved  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pantry_items (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label          TEXT        NOT NULL,
  quantity       TEXT        DEFAULT NULL,
  source         TEXT        NOT NULL DEFAULT 'manual',
  last_seen_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pendulum_events (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  signal_window TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'observed' CHECK (status IN ('observed', 'offered', 'dismissed', 'accepted')),
  copy          TEXT        NOT NULL,
  metadata      JSONB       NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS noseyquestions_log (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question    TEXT        NOT NULL,
  answer      TEXT        DEFAULT NULL,
  status      TEXT        NOT NULL DEFAULT 'asked' CHECK (status IN ('asked', 'answered', 'skipped', 'dismissed')),
  asked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE generated_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenshot_ingestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE envelopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pendulum_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE noseyquestions_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "generated_plans: owner access"
  ON generated_plans FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "plan_steps: owner access through plan"
  ON plan_steps FOR ALL
  USING (EXISTS (
    SELECT 1 FROM generated_plans
    WHERE generated_plans.id = plan_steps.plan_id
      AND generated_plans.profile_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM generated_plans
    WHERE generated_plans.id = plan_steps.plan_id
      AND generated_plans.profile_id = auth.uid()
  ));

CREATE POLICY "plan_actions: owner access"
  ON plan_actions FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "screenshot_ingestions: owner access"
  ON screenshot_ingestions FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "accounts: owner access"
  ON accounts FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "transactions: owner access"
  ON transactions FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "envelopes: owner access"
  ON envelopes FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "pantry_items: owner access"
  ON pantry_items FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "pendulum_events: owner access"
  ON pendulum_events FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "noseyquestions_log: owner access"
  ON noseyquestions_log FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());
