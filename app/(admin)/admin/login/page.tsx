import { sanitizeRedirectPath } from '@/lib/auth/redirect';
import AdminLoginForm from './admin-login-form';
import { LoginHero } from '@/components/brand/LoginHero';
import { LogoWatermark } from '@/components/brand/LogoWatermark';
import '@/app/admin-theme.css';

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
    <main className="admin-login-page relative flex min-h-screen" data-admin-login data-admin-portal>
      <LoginHero />

      <div className="admin-login-form-panel relative z-[1] flex w-full flex-col items-center justify-center px-4 py-12 lg:w-1/2">
        <LogoWatermark variant="login-card" />
        <div className="admin-login-card admin-login-card--glass relative z-[1] w-full max-w-md">
          <AdminLoginForm redirectPath={sanitizeRedirectPath(params.redirect, '/admin')} />
        </div>
      </div>
    </main>
  );
}
