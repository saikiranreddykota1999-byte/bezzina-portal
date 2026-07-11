-- Contact email + billing address for customer receipts

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS billing_address TEXT;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
