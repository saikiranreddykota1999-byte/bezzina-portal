import { AccountPlaceholder } from '@/components/account/account-placeholder';

export default function NotificationsPage() {
  return (
    <AccountPlaceholder
      title="Notifications"
      description="Manage email updates and order notifications."
      features={['Order status emails', 'Promotional updates', 'Stock alerts']}
    />
  );
}
