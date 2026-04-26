-- Tether | Spectre Labs
-- Migration 05: Identity Upgrade — adds is_registered flag to profiles
-- Tracks whether an anonymous (Ghost) operative has bound a permanent identity.
-- Source of truth remains supabase.auth.users.is_anonymous; this column is a
-- denormalized convenience for app-layer queries.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_registered BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN profiles.is_registered IS
  'TRUE after a Ghost operative upgrades via supabase.auth.updateUser(). UUID is preserved.';
