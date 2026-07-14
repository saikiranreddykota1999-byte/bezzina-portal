-- Require password change on first login for newly provisioned staff accounts

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_force_password_change
  ON profiles (force_password_change)
  WHERE force_password_change = true;
