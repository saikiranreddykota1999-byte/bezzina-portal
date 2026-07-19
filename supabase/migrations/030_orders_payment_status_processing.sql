-- Allow payment_status = processing (Stripe PI processing; not paid / not fulfillable).

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded'));
