import { getNewsletterSubscribersAction } from '@/actions/admin-newsletter';
import { NewsletterManager } from '@/components/admin/newsletter-manager';

export const metadata = { title: 'Newsletter | Admin' };

export default async function AdminNewsletterPage() {
  const result = await getNewsletterSubscribersAction();
  if (!result.success) return <p className="text-red-600">{result.error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Newsletter</h1>
      <p className="mt-1 text-sm text-slate-600">View subscribers and export mailing lists.</p>
      <div className="mt-8">
        <NewsletterManager subscribers={result.data ?? []} />
      </div>
    </div>
  );
}
