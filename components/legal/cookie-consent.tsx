'use client';

import { useState } from 'react';
import Link from 'next/link';
import { brandClasses } from '@/lib/brand';

const CONSENT_KEY = 'bezzina-cookie-consent';

function readConsentRequired(): boolean {
  if (typeof window === 'undefined') return false;
  return !window.localStorage.getItem(CONSENT_KEY);
}

export function CookieConsent() {
  const [visible, setVisible] = useState(readConsentRequired);

  function accept() {
    window.localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  }

  function decline() {
    window.localStorage.setItem(CONSENT_KEY, 'essential-only');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie preferences"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="site-chrome fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-3xl rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(11,61,145,0.15)] sm:inset-x-6"
    >
      <h2 id="cookie-consent-title" className="text-base font-semibold text-[#071B35]">
        Cookie preferences
      </h2>
      <p id="cookie-consent-description" className="mt-2 text-sm leading-6 text-slate-600">
        We use essential cookies for account, cart, and quote functionality. See our{' '}
        <Link href="/cookies" className={brandClasses.link}>
          Cookie Policy
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className={brandClasses.link}>
          Privacy Policy
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={decline} className={brandClasses.btnSecondary}>
          Essential only
        </button>
        <button type="button" onClick={accept} className={brandClasses.btnPrimary}>
          Accept
        </button>
      </div>
    </div>
  );
}
