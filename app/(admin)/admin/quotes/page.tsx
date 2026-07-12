import { getAdminQuotesList } from '@/actions/admin-quotes';
import { QuotesManager } from '@/components/admin/quotes-manager';

export const metadata = { title: 'Quote Requests | Admin' };

export default async function AdminQuotesPage() {
  const result = await getAdminQuotesList();
  if (!result.success) return <p className="text-red-600">{result.error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Quote Requests</h1>
      <p className="mt-1 text-sm text-slate-600">Review and update customer quotation requests.</p>
      <div className="mt-8">
        <QuotesManager quotes={result.data ?? []} />
      </div>
    </div>
  );
}
