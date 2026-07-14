'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifySuperAdminMfaLoginAction } from '@/actions/admin-mfa';

export function SuperAdminMfaVerifyForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await verifySuperAdminMfaLoginAction(code);
    if (!result.success) {
      setMessage(result.error);
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-[var(--admin-text-muted)]">
        Enter the 6-digit code from your authenticator app to complete sign-in.
      </p>

      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        required
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="6-digit code"
        className="admin-input w-full text-center tracking-[0.3em]"
      />

      {message && (
        <p className="text-sm text-[var(--admin-danger)]" role="alert">
          {message}
        </p>
      )}

      <button type="submit" className="admin-btn admin-btn--primary w-full" disabled={loading}>
        {loading ? 'Verifying…' : 'Verify and continue'}
      </button>
    </form>
  );
}
