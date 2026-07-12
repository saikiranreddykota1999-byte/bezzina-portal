import { guardAdminPage } from '@/lib/admin/guard-page';

export default async function PickupOrdersAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardAdminPage('pickup:manage');
  return children;
}
