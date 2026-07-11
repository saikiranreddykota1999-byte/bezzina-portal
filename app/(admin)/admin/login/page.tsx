import { sanitizeRedirectPath } from '@/lib/auth/redirect';
import AdminLoginForm from './admin-login-form';

type PageProps = {
  searchParams: Promise<{ redirect?: string }>;
};

export const metadata = {
  title: 'Admin Login | Joseph Bezzina & Co Ltd',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <AdminLoginForm redirectPath={sanitizeRedirectPath(params.redirect, '/admin')} />
      </div>
    </main>
  );
}
