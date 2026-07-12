import { redirect } from 'next/navigation';
import { getCustomerNotifications } from '@/actions/customer-portal';
import { NotificationList } from '@/components/account/notification-list';

export const metadata = { title: 'Notifications | Account' };

export default async function NotificationsPage() {
  const result = await getCustomerNotifications();
  if (!result.success && result.error === 'Sign in required') redirect('/account/login');

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Notifications</h1>
      <p className="mb-6 text-sm text-slate-600">Quote updates, account alerts, and order notifications.</p>
      <NotificationList notifications={result.success ? result.data ?? [] : []} />
    </div>
  );
}
