import { AccountPlaceholder } from '@/components/account/account-placeholder';

export default function AddressesPage() {
  return (
    <AccountPlaceholder
      title="Address Book"
      description="Save delivery addresses for faster checkout."
      features={['Multiple addresses', 'Default address', 'Edit and delete']}
    />
  );
}
