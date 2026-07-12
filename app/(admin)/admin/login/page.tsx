import Image from 'next/image';
import { sanitizeRedirectPath } from '@/lib/auth/redirect';
import AdminLoginForm from './admin-login-form';
import { AdminWatermark } from '@/components/admin/admin-watermark';
import { company } from '@/config/company';
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
    <main
      className="relative flex min-h-screen"
      data-admin-login
      data-admin-portal
    >
      <AdminWatermark />

      <div className="admin-login-panel relative z-[1] hidden w-1/2 flex-col justify-between p-10 lg:flex xl:p-14">
        <div>
          <Image
            src={company.logoUrl}
            alt="Joseph Bezzina & Co. Ltd"
            width={64}
            height={64}
            className="h-16 w-auto rounded-xl bg-white p-2 shadow-lg"
          />
          <h1 className="mt-8 max-w-md text-3xl font-bold leading-tight text-white xl:text-4xl">
            {company.name}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/80">
            Malta&apos;s Trusted Marine &amp; Industrial Supply Partner Since 1969
          </p>
        </div>
        <p className="text-sm text-white/50">
          &copy; {new Date().getFullYear()} Joseph Bezzina &amp; Co. Ltd. All rights reserved.
        </p>
      </div>

      <div className="admin-content relative z-[1] flex w-full flex-col items-center justify-center bg-[var(--admin-bg)] px-4 py-12 lg:w-1/2">
        <div className="admin-login-card w-full max-w-md">
          <AdminLoginForm redirectPath={sanitizeRedirectPath(params.redirect, '/admin')} />
        </div>
      </div>
    </main>
  );
}
