import { AccountPlaceholder } from '@/components/account/account-placeholder';

export default function AdminProfilePage() {
  return (
    <AccountPlaceholder
      title="Admin Profile"
      description="Manage your admin account settings."
      features={['Profile picture', 'Password change', 'Logout']}
    />
  );
}
