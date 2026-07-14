'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SECURITY_CONFIG } from '@/config/security';

type Props = {
  /** When true, idle timeout is enforced (admin portal). */
  enabled?: boolean;
};

export function SessionIdleGuard({ enabled = true }: Props) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutMs = SECURITY_CONFIG.inactivityTimeoutMinutes * 60 * 1000;

  const signOutIdle = useCallback(async () => {
    if (!enabled || timeoutMs <= 0) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login?error=session_expired');
    router.refresh();
  }, [enabled, timeoutMs, router]);

  const resetTimer = useCallback(() => {
    if (!enabled || timeoutMs <= 0) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(signOutIdle, timeoutMs);
  }, [enabled, timeoutMs, signOutIdle]);

  useEffect(() => {
    if (!enabled || timeoutMs <= 0) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [enabled, timeoutMs, resetTimer]);

  return null;
}
