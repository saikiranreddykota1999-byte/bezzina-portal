'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { completeRequiredPasswordChangeAction } from '@/actions/force-password-change';
import { PasswordStrengthMeter } from '@/components/auth/password-strength-meter';
import { getDefaultDashboardPath } from '@/lib/auth/oms-permissions';
import { ADMIN_MFA_SETUP_PATH } from '@/lib/auth/super-admin-mfa';

type Props = {
  userRole: string | null;
};

export function RequiredPasswordChangeForm({ userRole }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await completeRequiredPasswordChangeAction({ password });
    if (!result.success) {
      setMessage(result.error);
      setLoading(false);
      return;
    }

    const destination =
      userRole === 'super_admin' ? ADMIN_MFA_SETUP_PATH : getDefaultDashboardPath(userRole);
    router.push(destination);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-[var(--admin-text-muted)]">
        For security, you must set a new password before accessing the admin portal.
      </p>
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        aria-label="New password"
        aria-invalid={message ? true : undefined}
        className="admin-input w-full"
        autoComplete="new-password"
      />
      <PasswordStrengthMeter password={password} />
      {message && (
        <p className="text-sm text-[var(--admin-danger)]" role="alert">
          {message}
        </p>
      )}
      <button type="submit" className="admin-btn admin-btn--primary w-full" disabled={loading}>
        {loading ? 'Updating…' : 'Set new password and continue'}
      </button>
    </form>
  );
}
