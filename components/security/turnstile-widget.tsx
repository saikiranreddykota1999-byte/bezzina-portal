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

function getTurnstileApi(): TurnstileApi | undefined {
  return typeof window !== 'undefined' ? window.turnstile : undefined;
}

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

  // Script.onLoad may not re-fire on client navigations if the file is already cached.
  useEffect(() => {
    if (!siteKey) return;

    if (getTurnstileApi()) {
      getTurnstileApi()?.ready(() => setScriptReady(true));
      setScriptReady(true);
      return;
    }

    const timer = window.setInterval(() => {
      if (getTurnstileApi()) {
        window.clearInterval(timer);
        getTurnstileApi()?.ready(() => setScriptReady(true));
        setScriptReady(true);
      }
    }, 200);

    return () => window.clearInterval(timer);
  }, [siteKey]);

  const clearToken = useCallback(() => {
    onTokenChangeRef.current(null);
  }, []);

  useEffect(() => {
    if (!siteKey || !scriptReady || !containerRef.current) {
      return;
    }

    const api = getTurnstileApi();
    if (!api) return;

    let cancelled = false;

    const mount = () => {
      if (cancelled || !containerRef.current || !getTurnstileApi()) return;

      if (widgetIdRef.current) {
        getTurnstileApi()?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }

      // Clear any leftover DOM from a previous failed mount.
      containerRef.current.innerHTML = '';

      const size = mode === 'compact' ? 'compact' : mode === 'invisible' ? 'invisible' : 'normal';

      widgetIdRef.current = api.render(containerRef.current, {
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
    };

    api.ready(mount);

    return () => {
      cancelled = true;
      if (widgetIdRef.current && getTurnstileApi()) {
        getTurnstileApi()?.remove(widgetIdRef.current);
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
          getTurnstileApi()?.ready(() => setScriptReady(true));
          setScriptReady(true);
        }}
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
