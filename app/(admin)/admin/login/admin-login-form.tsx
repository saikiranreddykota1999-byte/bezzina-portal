'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { adminLogin } from '@/actions/auth';
import { loginSchema } from '@/lib/validators/auth';
import { AdminCheckbox } from '@/components/admin/ui/admin-checkbox';
import { AnimatedLogo } from '@/components/brand/AnimatedLogo';

type Props = {
  redirectPath: string;
};

const fieldMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export default function AdminLoginForm({ redirectPath }: Props) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
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
      <motion.div
        className="mb-8 flex flex-col items-center gap-4 text-center"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <AnimatedLogo variant="admin-login-card" animate priority />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-navy)]">Welcome Back</h1>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">Admin Management Portal</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <motion.div
          variants={fieldMotion}
          initial={reduceMotion ? false : 'initial'}
          animate="animate"
          transition={{ delay: 0.1 }}
        >
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
            className="admin-input admin-input--animated"
            placeholder="you@company.com"
          />
          {fieldErrors.email && (
            <p className="mt-1.5 text-sm text-[var(--admin-danger)]">{fieldErrors.email}</p>
          )}
        </motion.div>

        <motion.div
          variants={fieldMotion}
          initial={reduceMotion ? false : 'initial'}
          animate="animate"
          transition={{ delay: 0.18 }}
        >
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
            className="admin-input admin-input--animated"
            placeholder="Enter your password"
          />
          {fieldErrors.password && (
            <p className="mt-1.5 text-sm text-[var(--admin-danger)]">{fieldErrors.password}</p>
          )}
        </motion.div>

        <motion.div
          className="flex items-center justify-between gap-4"
          variants={fieldMotion}
          initial={reduceMotion ? false : 'initial'}
          animate="animate"
          transition={{ delay: 0.26 }}
        >
          <AdminCheckbox
            id="remember-me"
            checked={rememberMe}
            onChange={setRememberMe}
            label="Remember me"
          />
          <Link href="/account/password" className="admin-link text-sm">
            Forgot password?
          </Link>
        </motion.div>

        {error && (
          <p className="admin-alert--error" role="alert">{error}</p>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          className="admin-btn admin-btn--primary admin-btn--login w-full"
          whileHover={reduceMotion || loading ? undefined : { scale: 1.01, y: -1 }}
          whileTap={reduceMotion || loading ? undefined : { scale: 0.99 }}
          transition={{ duration: 0.2 }}
        >
          {loading ? 'Signing in…' : 'Sign In to Admin'}
        </motion.button>
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
