'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  enrollSuperAdminMfaAction,
  verifySuperAdminMfaEnrollmentAction,
} from '@/actions/admin-mfa';

export function SuperAdminMfaSetupForm() {
  const router = useRouter();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleStartEnrollment() {
    setLoading(true);
    setMessage('');

    const result = await enrollSuperAdminMfaAction();
    if (!result.success || !result.data) {
      setMessage(result.success ? 'Unable to start MFA enrollment.' : result.error);
      setLoading(false);
      return;
    }

    setFactorId(result.data.factorId);
    setQrCode(result.data.qrCode);
    setSecret(result.data.secret);
    setLoading(false);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;

    setLoading(true);
    setMessage('');

    const result = await verifySuperAdminMfaEnrollmentAction(factorId, code);
    if (!result.success) {
      setMessage(result.error);
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  if (!factorId) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--admin-text-muted)]">
          Super Admin accounts must use an authenticator app (Google Authenticator, Authy, 1Password, etc.).
        </p>
        {message && (
          <p className="text-sm text-[var(--admin-danger)]" role="alert">
            {message}
          </p>
        )}
        <button
          type="button"
          className="admin-btn admin-btn--primary w-full"
          disabled={loading}
          onClick={handleStartEnrollment}
        >
          {loading ? 'Preparing…' : 'Set up authenticator app'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <p className="text-sm text-[var(--admin-text-muted)]">
        Scan this QR code with your authenticator app, then enter the 6-digit code to finish setup.
      </p>

      {qrCode ? (
        <div
          className="mx-auto flex max-w-[220px] justify-center rounded-lg border border-[var(--admin-border)] bg-white p-4"
          // Supabase returns an SVG string for the QR code.
          dangerouslySetInnerHTML={{ __html: qrCode }}
        />
      ) : null}

      {secret ? (
        <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3">
          <p className="text-xs font-medium text-[var(--admin-text-muted)]">Manual entry key</p>
          <p className="mt-1 break-all font-mono text-sm text-[var(--admin-navy)]">{secret}</p>
        </div>
      ) : null}

      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        required
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="6-digit code"
        aria-label="6-digit code"
        aria-invalid={message ? true : undefined}
        className="admin-input w-full text-center tracking-[0.3em]"
      />

      {message && (
        <p className="text-sm text-[var(--admin-danger)]" role="alert">
          {message}
        </p>
      )}

      <button type="submit" className="admin-btn admin-btn--primary w-full" disabled={loading}>
        {loading ? 'Verifying…' : 'Verify and enable MFA'}
      </button>
    </form>
  );
}
