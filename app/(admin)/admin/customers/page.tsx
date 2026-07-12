import { getAdminCustomers } from '@/actions/admin-customers';
import { CustomersManager } from '@/components/admin/customers-manager';

export const metadata = { title: 'Customers | Admin' };

export default async function AdminCustomersPage() {
  const result = await getAdminCustomers();
  if (!result.success) return <p className="text-red-600">{result.error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
      <p className="mt-1 text-sm text-slate-600">View and manage registered customers.</p>
      <div className="mt-8">
        <CustomersManager customers={result.data ?? []} />
      </div>
    </div>
  );
}
