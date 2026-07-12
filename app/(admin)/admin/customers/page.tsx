import { getAdminCustomers } from '@/actions/admin-customers';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { CustomersManager } from '@/components/admin/customers-manager';

export const metadata = { title: 'Customers | Admin' };

export default async function AdminCustomersPage() {
  const result = await getAdminCustomers();
  if (!result.success) return <p className="text-[var(--admin-danger)]">{result.error}</p>;

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        description="View and manage registered customers."
      />
      <CustomersManager customers={result.data ?? []} />
    </div>
  );
}
