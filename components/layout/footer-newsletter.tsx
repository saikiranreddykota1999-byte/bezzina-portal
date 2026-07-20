'use client';

import { FormEvent, useState, useTransition } from 'react';
import { subscribeNewsletterAction } from '@/actions/newsletter';
import {
  TurnstileWidget,
  getBrowserTurnstileSiteKey,
} from '@/components/security/turnstile-widget';
import { brandClasses } from '@/lib/brand';

export function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const siteKey = getBrowserTurnstileSiteKey();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (siteKey && !turnstileToken) {
      setError('Please complete the bot check before subscribing.');
      return;
    }

    startTransition(async () => {
      const result = await subscribeNewsletterAction({
        email,
        turnstileToken: turnstileToken ?? '',
      });
      setTurnstileReset((value) => value + 1);
      setTurnstileToken(null);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setEmail('');
      setMessage('Thanks — you are subscribed to product updates.');
    });
  }

  return (
    <section aria-labelledby="footer-newsletter">
      <h2 id="footer-newsletter" className="text-lg font-semibold text-white">
        Product updates
      </h2>
      <p className="mt-2 text-sm text-slate-300">
        Occasional news on marine and industrial supply arrivals.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="footer-newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="footer-newsletter-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
          />
          <button
            type="submit"
            disabled={isPending}
            className={`${brandClasses.btnPrimary} shrink-0 px-4 py-2 disabled:opacity-60`}
          >
            {isPending ? 'Subscribing…' : 'Subscribe'}
          </button>
        </div>
        <TurnstileWidget
          siteKey={siteKey}
          action="newsletter"
          mode="compact"
          resetKey={turnstileReset}
          onTokenChange={setTurnstileToken}
          className="min-h-[65px]"
        />
      </form>
      {message && <p className="mt-2 text-sm text-emerald-400">{message}</p>}
      {error && (
        <p className="mt-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
