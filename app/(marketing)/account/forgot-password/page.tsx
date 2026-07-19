import { Suspense } from 'react';
import { ForgotPasswordForm } from './forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Forgot password</h1>
          <p className="mt-2 text-sm text-slate-600">Loading…</p>
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
