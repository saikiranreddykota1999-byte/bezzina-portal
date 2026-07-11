import { Suspense } from 'react';
import AdminLoginForm from './admin-login-form';

export const metadata = {
  title: 'Admin Login | Joseph Bezzina & Co Ltd',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Suspense fallback={<p className="text-slate-600">Loading…</p>}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </main>
  );
}
