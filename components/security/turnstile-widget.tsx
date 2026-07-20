'use client';

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
  remove: (widgetId?: string) => void;
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

let turnstileScriptPromise: Promise<void> | null = null;

function ensureTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (turnstileScriptPromise) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-bezzina-turnstile="true"]',
    );
    if (existing) {
      if (window.turnstile) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Turnstile script failed to load')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.dataset.bezzinaTurnstile = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Turnstile script failed to load'));
    document.head.appendChild(script);
  }).catch((error) => {
    turnstileScriptPromise = null;
    throw error;
  });

  return turnstileScriptPromise;
}

async function waitForTurnstileApi(timeoutMs = 10000): Promise<TurnstileApi> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (window.turnstile) return window.turnstile;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('Turnstile API not available');
}

/**
 * Cloudflare Turnstile widget. Failures stay local so the page never crashes.
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
  const onTokenChangeRef = useRef(onTokenChange);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    if (!siteKey) return;

    let cancelled = false;
    let widgetId: string | null = null;

    const mount = async () => {
      try {
        await ensureTurnstileScript();
        const api = await waitForTurnstileApi();
        if (cancelled) return;

        // Retry a few times — Strict Mode / layout can briefly detach the node.
        let el: HTMLDivElement | null = null;
        for (let attempt = 0; attempt < 10; attempt += 1) {
          el = containerRef.current;
          if (el && el.isConnected) break;
          await new Promise((resolve) => setTimeout(resolve, 50));
          if (cancelled) return;
        }
        if (!el || !el.isConnected) {
          throw new Error('Turnstile container missing');
        }

        widgetId = api.render(el, {
          sitekey: siteKey,
          action,
          size: mode === 'compact' ? 'compact' : mode === 'invisible' ? 'invisible' : 'normal',
          appearance: mode === 'invisible' ? 'interaction-only' : 'always',
          theme: 'light',
          retry: 'auto',
          callback: (token) => onTokenChangeRef.current(token),
          'expired-callback': () => onTokenChangeRef.current(null),
          'error-callback': () => onTokenChangeRef.current(null),
        });

        if (!cancelled) setFailed(false);
      } catch {
        if (!cancelled) {
          setFailed(true);
          onTokenChangeRef.current(null);
        }
      }
    };

    void mount();

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          // ignore
        }
      }
    };
  }, [siteKey, action, mode, resetKey]);

  if (!siteKey) return null;

  return (
    <div className={className}>
      <div
        ref={containerRef}
        id={`turnstile-${reactId.replace(/:/g, '')}`}
        data-turnstile-action={action}
        className="min-h-[65px]"
      />
      {failed ? (
        <p className="mt-2 text-xs text-slate-500" role="status">
          Bot check could not load. Refresh the page and try again.
        </p>
      ) : null}
    </div>
  );
}

export function getBrowserTurnstileSiteKey(): string | null {
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  return key || null;
}
