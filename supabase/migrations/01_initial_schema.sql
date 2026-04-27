-- Tether | Spectre Labs
-- Migration 01: Initial Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles: core user identity with crisis state
CREATE TABLE profiles (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  random_handle TEXT       NOT NULL UNIQUE
                           CHECK (char_length(random_handle) BETWEEN 3 AND 32),
  is_crisis_mode   BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_pending BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Life Sectors: tarnish levels across key life dimensions (one row per profile)
CREATE TABLE life_sectors (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  finance    FLOAT   NOT NULL DEFAULT 0.0,
  health     FLOAT   NOT NULL DEFAULT 0.0,
  work       FLOAT   NOT NULL DEFAULT 0.0,
  groceries  FLOAT   NOT NULL DEFAULT 0.0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER life_sectors_updated_at
  BEFORE UPDATE ON life_sectors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: row-level security — users only touch their own data
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_sectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: own row" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "life_sectors: own profile" ON life_sectors
  FOR ALL USING (
    profile_id IN (SELECT id FROM profiles WHERE id = auth.uid())
  );
