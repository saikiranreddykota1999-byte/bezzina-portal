import Link from 'next/link';
import { ADMIN_NAV } from '@/config/admin-nav';
import { guardAdminPage } from '@/lib/admin/guard-page';
import { getAdminPermissionForSection } from '@/lib/admin/section-permission';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import {
  adminButtonPrimaryClass,
  adminButtonSecondaryClass,
  adminCardClass,
  adminHeadingClass,
  adminSubtextClass,
} from '@/components/admin/admin-styles';

type Props = { params: Promise<{ section: string }> };

const SECTION_MAP = Object.fromEntries(
  ADMIN_NAV.filter((n) => n.href !== '/admin').map((n) => [
    n.href.replace('/admin/', ''),
    n.title,
  ]),
);

const MODULE_FEATURES: Record<string, string[]> = {
  products: [
    'Add, edit, and delete products',
    'Bulk upload and CSV import/export',
    'Multiple images, video, PDF, and technical documents',
    'Featured, fast selling, upcoming, future, and discount flags',
    'SEO fields, slug, and tags',
  ],
  orders: ['View and manage orders', 'Order status updates', 'Invoice download'],
  customers: ['Customer profiles', 'Order history', 'Address book'],
  inventory: ['Stock levels', 'Low stock alerts', 'Availability status'],
  'activity-logs': ['Audit trail', 'User actions', 'System events'],
  'system-logs': ['Error logs', 'API events', 'Debug output'],
  'email-templates': ['Order confirmation', 'Shipping updates', 'Password reset'],
  'future-products': ['Pipeline products', 'Launch planning'],
  'fast-selling': ['Top performers', 'Reorder suggestions'],
};

export async function generateMetadata({ params }: Props) {
  const { section } = await params;
  const title = SECTION_MAP[section] ?? 'Admin';
  return { title: `${title} | Admin` };
}

export default async function AdminSectionPage({ params }: Props) {
  const { section } = await params;
  await guardAdminPage(getAdminPermissionForSection(section));
  const title = SECTION_MAP[section] ?? section.replace(/-/g, ' ');
  const features = MODULE_FEATURES[section] ?? [
    'Module configured and ready for data integration.',
    'Connect to Supabase tables and enable write operations.',
  ];

  return (
    <div>
      <AdminPageHeader
        title={title}
        description={`Enterprise admin — ${title.toLowerCase()} management.`}
        className="capitalize"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`${adminCardClass} p-6`}>
          <h2 className={adminHeadingClass}>Capabilities</h2>
          <ul className={`mt-4 space-y-2 text-sm ${adminSubtextClass}`}>
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--admin-primary)]" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className={`${adminCardClass} border-dashed p-6`}>
          <h2 className={adminHeadingClass}>Quick actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/admin" className={adminButtonSecondaryClass}>
              Dashboard
            </Link>
            {section === 'products' && (
              <Link href="/products" className={adminButtonPrimaryClass}>
                View Catalogue
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
