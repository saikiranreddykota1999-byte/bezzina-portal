import { Suspense } from 'react';
import { AccountDashboardSection } from '@/components/account/account-dashboard-section';
import { AccountSessionLoading } from '@/components/auth/account-session-loading';

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default function AccountDashboardPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<AccountSessionLoading />}>
      <AccountDashboardSection searchParams={searchParams} />
    </Suspense>
  );
}
