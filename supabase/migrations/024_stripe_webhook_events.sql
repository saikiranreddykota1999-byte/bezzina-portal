-- Stripe webhook idempotency and payment reconciliation

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payment_intent_id TEXT,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_pi
  ON stripe_webhook_events (payment_intent_id)
  WHERE payment_intent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_payment_reference
  ON orders (payment_reference)
  WHERE payment_reference IS NOT NULL;

ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;
