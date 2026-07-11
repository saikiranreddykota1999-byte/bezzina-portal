# Client Confirmations Required

The following design decisions use sensible defaults until confirmed by the client.

## 1. WhatsApp Business Number

Quote buttons use `NEXT_PUBLIC_WHATSAPP_NUMBER` (defaults to `35621226647` from landline `+356 2122 6647`).

**Action:** Confirm the official WhatsApp Business number for `wa.me` links.

## 2. WhatsApp OAuth Login

Native "Sign in with WhatsApp" is not a standard OAuth provider. The portal implements **phone-number OTP** via Supabase Phone Auth (SMS) as the substitute. The login page includes a notice explaining this.

**Action:** Confirm phone OTP is acceptable, or provide WhatsApp Business API credentials for custom OTP delivery.

## 3. Careers Form — CV vs Resume

The application form uses a single **CV/Resume** upload field (PDF/DOC, max 5 MB) plus an optional cover letter text area.

**Action:** Confirm whether separate CV and Resume uploads are required.

## 4. Brands Route

`/brands` permanently redirects (308) to `/products`. The Brands nav link has been removed.

**Action:** Confirm permanent redirect is acceptable vs. full page deletion.
