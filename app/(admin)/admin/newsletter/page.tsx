import { guardAdminPage } from '@/lib/admin/guard-page';
import { getNewsletterSubscribersAction } from '@/actions/admin-newsletter';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { NewsletterManager } from '@/components/admin/newsletter-manager';

export const metadata = { title: 'Newsletter | Admin' };

export default async function AdminNewsletterPage() {
  await guardAdminPage('newsletter:manage');
  const result = await getNewsletterSubscribersAction();
  if (!result.success) return <p className="text-[var(--admin-danger)]">{result.error}</p>;

  return (
    <div>
      <AdminPageHeader
        title="Newsletter"
        description="View subscribers and export mailing lists."
      />
      <NewsletterManager subscribers={result.data ?? []} />
    </div>
  );
}
