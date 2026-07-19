import { notFound } from 'next/navigation';
import { getAdminPermissionForSection } from '@/lib/admin/section-permission';
import { guardAdminPage } from '@/lib/admin/guard-page';

type Props = { params: Promise<{ section: string }> };

/**
 * Catch-all for unknown /admin/* paths. Real modules have dedicated routes;
 * unfinished stub capability pages are intentionally removed.
 */
export default async function AdminSectionPage({ params }: Props) {
  const { section } = await params;
  const permission = getAdminPermissionForSection(section);
  if (!permission) {
    notFound();
  }

  // Known nav slug without a dedicated page folder — still 404 rather than show a stub.
  await guardAdminPage(permission);
  notFound();
}
