'use client';

import { useState } from 'react';
import { submitContactEnquiryAction } from '@/actions/contact';
import {
  TurnstileWidget,
  getBrowserTurnstileSiteKey,
} from '@/components/security/turnstile-widget';
import { brandClasses } from '@/lib/brand';

const initialState = {
  name: '',
  email: '',
  phone: '',
  company: '',
  subject: '',
  message: '',
};

export function ContactForm() {
  const [form, setForm] = useState(initialState);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const siteKey = getBrowserTurnstileSiteKey();

  function updateField(field: keyof typeof initialState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError('');
    setSuccess(false);

    // Prefer React state; fall back to Cloudflare's hidden input if the callback raced.
    const domToken =
      typeof document !== 'undefined'
        ? (
            document.querySelector(
              '[data-turnstile-action="contact"] input[name="cf-turnstile-response"]',
            ) as HTMLInputElement | null
          )?.value?.trim() ?? ''
        : '';
    const token = (turnstileToken ?? '').trim() || domToken;

    if (siteKey && !token) {
      setPending(false);
      setError('Please complete the bot check before sending.');
      return;
    }

    const result = await submitContactEnquiryAction({
      ...form,
      turnstileToken: token,
    });

    setPending(false);
    setTurnstileReset((value) => value + 1);
    setTurnstileToken(null);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    setDemoMode(result.data?.channel === 'demo');
    setForm(initialState);
  }

  if (success) {
    return (
      <div
        role="status"
        className="rounded-[20px] border border-[#0B3D91]/20 bg-[#E8EFF9] p-6 text-sm text-[#071B35]"
      >
        <p className="font-semibold">Thank you — your enquiry has been received.</p>
        <p className="mt-2 leading-6 text-slate-700">
          Our team will respond as soon as possible. For urgent requirements, call us directly.
        </p>
        {demoMode && (
          <p className="mt-3 text-xs text-slate-600">
            Demo mode: email delivery is not configured. Staff were still notified in the admin portal.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-slate-800">
            Name <span className="text-red-600" aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className={brandClasses.input}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-slate-800">
            Email <span className="text-red-600" aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            className={brandClasses.input}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-phone" className="mb-1.5 block text-sm font-medium text-slate-800">
            Phone
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className={brandClasses.input}
          />
        </div>
        <div>
          <label htmlFor="contact-company" className="mb-1.5 block text-sm font-medium text-slate-800">
            Company
          </label>
          <input
            id="contact-company"
            name="company"
            type="text"
            autoComplete="organization"
            value={form.company}
            onChange={(e) => updateField('company', e.target.value)}
            className={brandClasses.input}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium text-slate-800">
          Subject <span className="text-red-600" aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          required
          value={form.subject}
          onChange={(e) => updateField('subject', e.target.value)}
          className={brandClasses.input}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-slate-800">
          Message <span className="text-red-600" aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => updateField('message', e.target.value)}
          className={`${brandClasses.input} resize-y`}
        />
      </div>

      <TurnstileWidget
        siteKey={siteKey}
        action="contact"
        mode="visible"
        resetKey={turnstileReset}
        onTokenChange={setTurnstileToken}
      />

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`${brandClasses.btnPrimary} disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {pending ? 'Sending…' : 'Send enquiry'}
      </button>
    </form>
  );
}
