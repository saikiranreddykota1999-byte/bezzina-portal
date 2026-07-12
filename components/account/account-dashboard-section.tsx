import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { AccountSessionError } from '@/components/auth/account-session-error';
import { getAuthenticatedUser } from '@/lib/auth/server-session';

const ACCOUNT_LINKS = [
  { title: 'Profile', href: '/account/profile', description: 'Name, phone, and profile picture' },
  { title: 'Addresses', href: '/account/addresses', description: 'Manage delivery addresses' },
  { title: 'Payment Cards', href: '/account/cards', description: 'Add and manage saved cards' },
  { title: 'Orders', href: '/account/orders', description: 'Order history and invoices' },
  { title: 'Quote History', href: '/account/quotes', description: 'Submitted quotation requests' },
  { title: 'Saved Quote Drafts', href: '/quote', description: 'Resume saved quote carts' },
  { title: 'Recently Viewed', href: '/account/recently-viewed', description: 'Products you browsed recently' },
  { title: 'Downloads', href: '/account/downloads', description: 'Datasheets and product documents' },
  { title: 'Favourite Products', href: '/account/wishlist', description: 'Saved products' },
  {
    title: 'Delivery Tracking',
    href: '/account/tracking',
    description: 'Track shipments by order or tracking number',
  },
  { title: 'Cart', href: '/account/cart', description: 'Review items before checkout' },
  { title: 'Checkout', href: '/account/checkout', description: 'Review order before payment' },
  { title: 'Payment', href: '/account/payment', description: 'Complete payment securely' },
  { title: 'Notifications', href: '/account/notifications', description: 'Email and order updates' },
  { title: 'Support Tickets', href: '/account/tickets', description: 'Get help from our team' },
  { title: 'Suggestion Box', href: '/account/suggestions', description: 'Share product ideas' },
  { title: 'Password', href: '/account/password', description: 'Change your password' },
];

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export async function AccountDashboardSection({ searchParams }: Props) {
  const [{ error }, session] = await Promise.all([searchParams, getAuthenticatedUser()]);

  if (session.authError) {
    return <AccountSessionError message={session.authError} />;
  }

  if (!session.user) {
    redirect('/account/login?redirect=/account');
  }

  const unauthorized = error === 'unauthorized';
  const displayName =
    session.profile?.full_name?.trim() ||
    session.user.email?.split('@')[0] ||
    'Account';

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, {displayName}. Manage your profile, orders, and preferences.
          </p>
        </div>
        <SignOutButton className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" />
      </div>

      {unauthorized && (
        <p
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          You do not have permission to access the admin area.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {ACCOUNT_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-orange-300 hover:shadow-sm"
          >
            <h2 className="font-semibold text-slate-900">{link.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
