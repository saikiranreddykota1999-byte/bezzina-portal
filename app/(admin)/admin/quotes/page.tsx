import { guardAdminPage } from '@/lib/admin/guard-page';
import { getAdminQuotesList } from '@/actions/admin-quotes';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { QuotesManager } from '@/components/admin/quotes-manager';

export const metadata = { title: 'Quote Requests | Admin' };

export default async function AdminQuotesPage() {
  await guardAdminPage('quotes:manage');
  const result = await getAdminQuotesList();
  if (!result.success) return <p className="text-[var(--admin-danger)]">{result.error}</p>;

  return (
    <div>
      <AdminPageHeader
        title="Quote Requests"
        description="Review and update customer quotation requests."
      />
      <QuotesManager quotes={result.data ?? []} />
    </div>
  );
}
