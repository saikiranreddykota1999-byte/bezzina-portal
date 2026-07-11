-- Custom 6-digit email OTP for passwordless login / account creation

CREATE TABLE IF NOT EXISTS email_otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_otp_lookup
  ON email_otp_codes (email, created_at DESC);

ALTER TABLE email_otp_codes ENABLE ROW LEVEL SECURITY;
