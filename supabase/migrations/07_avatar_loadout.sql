-- Tether | Spectre Labs
-- Migration 07: Avatar loadout system
--
-- Adds three columns to profiles:
--   avatar_body_id     — which of the 6 silhouettes the operative chose
--   avatar_loadout     — JSONB: currently equipped gear per slot
--   unlocked_gear_ids  — TEXT[]: all gear items the operative has earned
--
-- Default loadout is empty (NULL) until onboarding sets it.
-- The application layer resolves the body's starterGearIds on first load.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_body_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS avatar_loadout JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS unlocked_gear_ids TEXT[] DEFAULT '{}';

-- Constraint: avatar_body_id must be one of the six valid body codenames when set
ALTER TABLE profiles
  ADD CONSTRAINT avatar_body_id_valid CHECK (
    avatar_body_id IS NULL OR avatar_body_id IN (
      'phantom', 'sentinel', 'wraith', 'titan', 'specter', 'ronin'
    )
  );

COMMENT ON COLUMN profiles.avatar_body_id IS 'Operative silhouette selection — one of 6 gender-neutral body types';
COMMENT ON COLUMN profiles.avatar_loadout IS 'Currently equipped gear: { helm?: id, torso?: id, legs?: id, accessory?: id }';
COMMENT ON COLUMN profiles.unlocked_gear_ids IS 'All gear item IDs the operative has earned or unlocked';
