-- Tether | Spectre Labs
-- Migration 03: Joint Ops Schema
-- Collaborative operations between profiles (family/squad coordination layer)
-- Tables: joint_ops, op_members, op_checkpoints

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- joint_ops: a shared mission owned by one profile, joined by others
CREATE TABLE joint_ops (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  codename     TEXT         NOT NULL,
  shimmer_mode TEXT         NOT NULL DEFAULT 'MILITARY'
                            CHECK (shimmer_mode IN ('MILITARY', 'ETHER')),
  status       TEXT         NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'standby', 'complete', 'aborted')),
  notes        TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- op_members: profiles participating in a joint op (owner is always a member)
CREATE TABLE op_members (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  op_id        UUID         NOT NULL REFERENCES joint_ops(id) ON DELETE CASCADE,
  profile_id   UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role         TEXT         NOT NULL DEFAULT 'operative'
                            CHECK (role IN ('commander', 'operative', 'observer')),
  joined_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (op_id, profile_id)
);

-- op_checkpoints: discrete tasks or milestones within a joint op
CREATE TABLE op_checkpoints (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  op_id        UUID         NOT NULL REFERENCES joint_ops(id) ON DELETE CASCADE,
  assigned_to  UUID         REFERENCES profiles(id) ON DELETE SET NULL,
  title        TEXT         NOT NULL,
  status       TEXT         NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'in_progress', 'complete', 'blocked')),
  priority     INTEGER      NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 4),
  due_at       TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- updated_at triggers (reuse function from migration 01)
CREATE TRIGGER joint_ops_updated_at
  BEFORE UPDATE ON joint_ops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER op_checkpoints_updated_at
  BEFORE UPDATE ON op_checkpoints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE joint_ops       ENABLE ROW LEVEL SECURITY;
ALTER TABLE op_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE op_checkpoints  ENABLE ROW LEVEL SECURITY;

-- joint_ops: visible to owner and any member; only owner can mutate
CREATE POLICY "joint_ops: member read" ON joint_ops
  FOR SELECT USING (
    owner_id = auth.uid()
    OR id IN (SELECT op_id FROM op_members WHERE profile_id = auth.uid())
  );

CREATE POLICY "joint_ops: owner insert" ON joint_ops
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "joint_ops: owner update" ON joint_ops
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "joint_ops: owner delete" ON joint_ops
  FOR DELETE USING (owner_id = auth.uid());

-- op_members: visible and manageable within ops the user belongs to or owns
CREATE POLICY "op_members: member read" ON op_members
  FOR SELECT USING (
    profile_id = auth.uid()
    OR op_id IN (SELECT id FROM joint_ops WHERE owner_id = auth.uid())
  );

CREATE POLICY "op_members: owner insert" ON op_members
  FOR INSERT WITH CHECK (
    op_id IN (SELECT id FROM joint_ops WHERE owner_id = auth.uid())
  );

CREATE POLICY "op_members: owner delete" ON op_members
  FOR DELETE USING (
    op_id IN (SELECT id FROM joint_ops WHERE owner_id = auth.uid())
  );

-- op_checkpoints: readable by all op members; writable by owner or assignee
CREATE POLICY "op_checkpoints: member read" ON op_checkpoints
  FOR SELECT USING (
    op_id IN (
      SELECT op_id FROM op_members WHERE profile_id = auth.uid()
      UNION
      SELECT id FROM joint_ops WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "op_checkpoints: owner insert" ON op_checkpoints
  FOR INSERT WITH CHECK (
    op_id IN (SELECT id FROM joint_ops WHERE owner_id = auth.uid())
  );

CREATE POLICY "op_checkpoints: owner or assignee update" ON op_checkpoints
  FOR UPDATE USING (
    assigned_to = auth.uid()
    OR op_id IN (SELECT id FROM joint_ops WHERE owner_id = auth.uid())
  );

CREATE POLICY "op_checkpoints: owner delete" ON op_checkpoints
  FOR DELETE USING (
    op_id IN (SELECT id FROM joint_ops WHERE owner_id = auth.uid())
  );
