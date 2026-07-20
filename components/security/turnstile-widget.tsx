'use client';

import Script from 'next/script';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

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
  /** invisible = challenge only when needed; compact for tight footers */
  mode?: 'visible' | 'compact' | 'invisible';
  className?: string;
  /** Bump to force a fresh challenge after a successful submit */
  resetKey?: number | string;
};

/**
 * Cloudflare Turnstile widget. When siteKey is missing (local/dev), renders nothing
 * and reports a null token — server assertTurnstile allows the skip when not required.
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
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  const clearToken = useCallback(() => {
    onTokenChangeRef.current(null);
  }, []);

  useEffect(() => {
    if (!siteKey || !scriptReady || !containerRef.current || !window.turnstile) {
      return;
    }

    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    }

    const size = mode === 'compact' ? 'compact' : mode === 'invisible' ? 'invisible' : 'normal';

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action,
      size,
      appearance: mode === 'invisible' ? 'interaction-only' : 'always',
      theme: 'light',
      retry: 'auto',
      callback: (token) => onTokenChangeRef.current(token),
      'expired-callback': clearToken,
      'error-callback': clearToken,
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, scriptReady, action, mode, clearToken, resetKey]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className={className}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => {
          window.turnstile?.ready(() => setScriptReady(true));
          setScriptReady(true);
        }}
      />
      <div
        ref={containerRef}
        id={`turnstile-${reactId.replace(/:/g, '')}`}
        data-turnstile-action={action}
      />
    </div>
  );
}

export function getBrowserTurnstileSiteKey(): string | null {
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  return key || null;
}
