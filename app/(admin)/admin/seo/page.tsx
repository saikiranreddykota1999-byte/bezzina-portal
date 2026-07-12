import { getSeoPagesAction } from '@/actions/admin-seo';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { SeoManager } from '@/components/admin/seo-manager';

export const metadata = { title: 'SEO Manager | Admin' };

export default async function AdminSeoPage() {
  const result = await getSeoPagesAction();
  if (!result.success) return <p className="text-[var(--admin-danger)]">{result.error}</p>;

  return (
    <div>
      <AdminPageHeader
        title="SEO Manager"
        description="Page titles, meta descriptions, keywords, and robots settings."
      />
      <SeoManager pages={result.data ?? []} />
    </div>
  );
}
