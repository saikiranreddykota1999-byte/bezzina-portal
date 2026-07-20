'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { getQuoteCustomerPrefillAction, submitQuoteRequest } from '@/actions/quotes';
import {
  TurnstileWidget,
  getBrowserTurnstileSiteKey,
} from '@/components/security/turnstile-widget';
import { buildMultiQuoteMessage, buildWhatsAppUrl } from '@/lib/whatsapp';
import { RippleButton } from '@/components/ui/ripple-button';
import type { QuoteCartItem } from '@/types/quote';

const inputClassName =
  'w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500';

type QuoteSubmitFormProps = {
  items: QuoteCartItem[];
  notes: string;
  onBack: () => void;
  onSuccess: (reference: string) => void;
};

export function QuoteSubmitForm({ items, notes, onBack, onSuccess }: QuoteSubmitFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingPrefill, setLoadingPrefill] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const siteKey = getBrowserTurnstileSiteKey();

  const whatsappHref = buildWhatsAppUrl(
    buildMultiQuoteMessage(
      items.map((item) => ({ name: item.name, sku: item.sku, quantity: item.quantity })),
    ),
  );

  useEffect(() => {
    let cancelled = false;

    async function loadPrefill() {
      const result = await getQuoteCustomerPrefillAction();
      if (cancelled) return;

      if (result.success && result.data) {
        setName(result.data.name);
        setEmail(result.data.email);
        setPhone(result.data.phone);
      }
      setLoadingPrefill(false);
    }

    void loadPrefill();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (loadingPrefill || submitting) return;

    if (siteKey && !turnstileToken) {
      setError('Please complete the bot check before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    const result = await submitQuoteRequest(
      items,
      { name, email, phone, companyName, turnstileToken: turnstileToken ?? '' },
      notes,
    );

    setTurnstileReset((value) => value + 1);
    setTurnstileToken(null);

    if (result.success && result.data) {
      onSuccess(result.data.reference);
      return;
    }

    setError(result.success ? '' : result.error);
    setSubmitting(false);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-medium text-[#0B3D91] underline underline-offset-2 hover:text-[#09407a]"
      >
        ← Back to quote cart
      </button>

      <h2 className="mt-4 text-lg font-semibold text-slate-900">Your contact details</h2>
      <p className="mt-1 text-sm text-slate-600">
        We will use these details to respond to your quote request.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="quote-name" className="mb-1.5 block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            id="quote-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={loadingPrefill || submitting}
            className={inputClassName}
            placeholder="Your full name"
          />
        </div>

        <div>
          <label htmlFor="quote-email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="quote-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loadingPrefill || submitting}
            className={inputClassName}
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label htmlFor="quote-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
            Phone
          </label>
          <input
            id="quote-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            disabled={loadingPrefill || submitting}
            className={inputClassName}
            placeholder="+356 7757 6721"
          />
        </div>

        <div>
          <label htmlFor="quote-company" className="mb-1.5 block text-sm font-medium text-slate-700">
            Company <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id="quote-company"
            type="text"
            autoComplete="organization"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            disabled={loadingPrefill || submitting}
            className={inputClassName}
            placeholder="Company name"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <TurnstileWidget
          siteKey={siteKey}
          action="quote"
          mode="visible"
          resetKey={turnstileReset}
          onTokenChange={setTurnstileToken}
        />

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <RippleButton type="submit" className="flex-1" variant="primary">
            {loadingPrefill
              ? 'Loading…'
              : submitting
                ? 'Submitting…'
                : 'Submit Quote Request'}
          </RippleButton>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#25D366] bg-white px-6 py-3 text-sm font-semibold text-[#128C7E] transition hover:bg-green-50"
          >
            <MessageCircle className="h-4 w-4" />
            Send via WhatsApp instead
          </a>
        </div>
      </form>
    </div>
  );
}
