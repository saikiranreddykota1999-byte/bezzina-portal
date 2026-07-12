import { guardAdminPage } from '@/lib/admin/guard-page';
import Link from 'next/link';
import { getAdminCustomer, resetCustomerPasswordAction } from '@/actions/admin-customers';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { CustomerDetailForm } from '@/components/admin/customer-detail-form';
import {
  adminCardClass,
  adminHeadingClass,
  adminLinkClass,
  adminSubtextClass,
} from '@/components/admin/admin-styles';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Customer ${id.slice(0, 8)} | Admin` };
}

export default async function AdminCustomerDetailPage({ params }: Props) {
  await guardAdminPage('customers:manage');
  const { id } = await params;
  const result = await getAdminCustomer(id);

  if (!result.success) {
    return (
      <div>
        <p className="text-[var(--admin-danger)]">{result.error}</p>
        <Link href="/admin/customers" className={`mt-4 inline-block ${adminLinkClass}`}>
          ← Back to customers
        </Link>
      </div>
    );
  }

  const { customer, quotes } = result.data;

  return (
    <div>
      <Link href="/admin/customers" className={adminLinkClass}>
        ← Back to customers
      </Link>
      <AdminPageHeader
        className="mt-4"
        title={customer.full_name ?? customer.email}
        description={customer.email}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <CustomerDetailForm customer={customer} resetPasswordAction={resetCustomerPasswordAction} />

        <div className={`${adminCardClass} p-6`}>
          <h2 className={adminHeadingClass}>Quote History</h2>
          {quotes.length === 0 ? (
            <p className={`mt-4 ${adminSubtextClass}`}>No quotes submitted.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {quotes.map((q) => (
                <li key={q.id} className={`rounded-lg border border-[var(--admin-border)] px-4 py-3 text-sm`}>
                  <p className="font-medium text-[var(--admin-navy)]">{q.reference}</p>
                  <p className={adminSubtextClass}>{q.status} · {new Date(q.created_at).toLocaleDateString('en-GB')}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
