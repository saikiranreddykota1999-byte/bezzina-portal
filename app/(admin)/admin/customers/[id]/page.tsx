import Link from 'next/link';
import { getAdminCustomer, resetCustomerPasswordAction } from '@/actions/admin-customers';
import { CustomerDetailForm } from '@/components/admin/customer-detail-form';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Customer ${id.slice(0, 8)} | Admin` };
}

export default async function AdminCustomerDetailPage({ params }: Props) {
  const { id } = await params;
  const result = await getAdminCustomer(id);

  if (!result.success) {
    return (
      <div>
        <p className="text-red-600">{result.error}</p>
        <Link href="/admin/customers" className="mt-4 inline-block text-orange-600 hover:underline">
          ← Back to customers
        </Link>
      </div>
    );
  }

  const { customer, quotes } = result.data;

  return (
    <div>
      <Link href="/admin/customers" className="text-sm text-orange-600 hover:underline">
        ← Back to customers
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">{customer.full_name ?? customer.email}</h1>
      <p className="mt-1 text-sm text-slate-600">{customer.email}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <CustomerDetailForm customer={customer} resetPasswordAction={resetCustomerPasswordAction} />

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold">Quote History</h2>
          {quotes.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No quotes submitted.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {quotes.map((q) => (
                <li key={q.id} className="rounded-lg border border-slate-200 px-4 py-3 text-sm">
                  <p className="font-medium">{q.reference}</p>
                  <p className="text-slate-500">{q.status} · {new Date(q.created_at).toLocaleDateString('en-GB')}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
