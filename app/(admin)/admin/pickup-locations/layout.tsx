import { guardAdminPage } from '@/lib/admin/guard-page';

export default async function PickupLocationsAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardAdminPage('pickup:manage');
  return children;
}
