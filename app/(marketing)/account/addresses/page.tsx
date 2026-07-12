import { redirect } from 'next/navigation';
import { getUserAddresses } from '@/actions/customer-portal';
import { AddressBook } from '@/components/account/address-book';

export const metadata = { title: 'Addresses | Account' };

export default async function AddressesPage() {
  const result = await getUserAddresses();
  if (!result.success && result.error === 'Sign in required') redirect('/account/login');

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Address Book</h1>
      <p className="mb-6 text-sm text-slate-600">Save delivery addresses for faster checkout.</p>
      <AddressBook addresses={result.success ? result.data ?? [] : []} />
    </div>
  );
}
