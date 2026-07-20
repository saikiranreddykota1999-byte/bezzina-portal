'use client';

import Script from 'next/script';
import { useEffect, useId, useRef, useState } from 'react';

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      callback?: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
      theme?: 'light' | 'dark' | 'auto';
      size?: 'normal' | 'compact' | 'flexible' | 'invisible';
      appearance?: 'always' | 'execute' | 'interaction-only';
      action?: string;
      retry?: 'auto' | 'never';
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
  ready: (callback: () => void) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type TurnstileWidgetProps = {
  siteKey: string | null | undefined;
  action: string;
  onTokenChange: (token: string | null) => void;
  mode?: 'visible' | 'compact' | 'invisible';
  className?: string;
  resetKey?: number | string;
};

/**
 * Cloudflare Turnstile widget. Renders nothing when siteKey is missing.
 */
export function TurnstileWidget({
  siteKey,
  action,
  onTokenChange,
  mode = 'visible',
  className,
  resetKey = 0,
}: TurnstileWidgetProps) {
  const reactId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const [loadTick, setLoadTick] = useState(0);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    if (!siteKey) return;

    let cancelled = false;
    let attempts = 0;

    const clearWidget = () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore remove races
        }
        widgetIdRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };

    const tryMount = () => {
      if (cancelled) return false;
      const api = window.turnstile;
      const el = containerRef.current;
      if (!api || !el) return false;

      clearWidget();

      const size = mode === 'compact' ? 'compact' : mode === 'invisible' ? 'invisible' : 'normal';

      widgetIdRef.current = api.render(el, {
        sitekey: siteKey,
        action,
        size,
        appearance: mode === 'invisible' ? 'interaction-only' : 'always',
        theme: 'light',
        retry: 'auto',
        callback: (token) => onTokenChangeRef.current(token),
        'expired-callback': () => onTokenChangeRef.current(null),
        'error-callback': () => onTokenChangeRef.current(null),
      });

      return true;
    };

    const mountWhenReady = () => {
      if (cancelled) return;
      if (tryMount()) return;

      attempts += 1;
      if (attempts > 40) return;
      window.setTimeout(mountWhenReady, 250);
    };

    if (window.turnstile) {
      window.turnstile.ready(mountWhenReady);
    } else {
      mountWhenReady();
    }

    return () => {
      cancelled = true;
      clearWidget();
    };
  }, [siteKey, action, mode, resetKey, loadTick]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className={className}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setLoadTick((value) => value + 1)}
      />
      <div
        ref={containerRef}
        id={`turnstile-${reactId.replace(/:/g, '')}`}
        data-turnstile-action={action}
        className="min-h-[65px]"
      />
    </div>
  );
}

export function getBrowserTurnstileSiteKey(): string | null {
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  return key || null;
}
