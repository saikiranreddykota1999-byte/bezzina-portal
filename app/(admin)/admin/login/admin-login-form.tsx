'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { adminLogin } from '@/actions/auth';
import { loginSchema } from '@/lib/validators/auth';
import { company } from '@/config/company';
import { AdminCheckbox } from '@/components/admin/ui/admin-checkbox';

type Props = {
  redirectPath: string;
};

export default function AdminLoginForm({ redirectPath }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string') errors[key] = issue.message;
      }
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    const result = await adminLogin(parsed.data.email, parsed.data.password);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(redirectPath);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full">
      <div className="mb-8 flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
        <Image
          src={company.logoUrl}
          alt={company.name}
          width={56}
          height={56}
          className="h-14 w-14 rounded-xl bg-[var(--admin-primary-light)] p-2 lg:hidden"
        />
        <div>
          <h1 className="text-2xl font-bold text-[var(--admin-navy)]">Admin Portal</h1>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">Staff access only</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="admin-email" className="admin-label">
            Email address
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="admin-input"
            placeholder="you@company.com"
          />
          {fieldErrors.email && (
            <p className="mt-1.5 text-sm text-[var(--admin-danger)]">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="admin-password" className="admin-label">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-input"
            placeholder="Enter your password"
          />
          {fieldErrors.password && (
            <p className="mt-1.5 text-sm text-[var(--admin-danger)]">{fieldErrors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <AdminCheckbox
            id="remember-me"
            checked={rememberMe}
            onChange={setRememberMe}
            label="Remember me"
          />
          <Link href="/account/password" className="admin-link text-sm">
            Forgot password?
          </Link>
        </div>

        {error && (
          <p className="admin-alert--error" role="alert">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="admin-btn admin-btn--primary w-full"
        >
          {loading ? 'Signing in…' : 'Sign In to Admin'}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-[var(--admin-text-muted)]">
        This page is not linked from the public site.{' '}
        <Link href="/account/login" className="admin-link">
          Customer login →
        </Link>
      </p>
    </div>
  );
}
