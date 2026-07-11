import Link from 'next/link';
import { ADMIN_NAV } from '@/config/admin-nav';

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
  const title = SECTION_MAP[section] ?? section.replace(/-/g, ' ');
  const features = MODULE_FEATURES[section] ?? [
    'Module configured and ready for data integration.',
    'Connect to Supabase tables and enable write operations.',
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold capitalize text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">Enterprise admin — {title.toLowerCase()} management.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">Capabilities</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900/50">
          <h2 className="font-semibold text-slate-900 dark:text-white">Quick actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600">
              Dashboard
            </Link>
            {section === 'products' && (
              <Link href="/products" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white">
                View Catalogue
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
