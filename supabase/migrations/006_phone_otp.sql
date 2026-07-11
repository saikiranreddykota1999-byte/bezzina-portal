-- Custom 6-digit phone OTP (does not require Supabase SMS provider)

CREATE TABLE IF NOT EXISTS phone_otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_phone_otp_lookup
  ON phone_otp_codes (phone, created_at DESC);

ALTER TABLE phone_otp_codes ENABLE ROW LEVEL SECURITY;

-- Only service role / server actions access this table (no public policies)
