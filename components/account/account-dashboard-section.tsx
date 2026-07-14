import { redirect } from 'next/navigation';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { AccountSessionError } from '@/components/auth/account-session-error';
import {
  AccountDashboardGrid,
  type AccountDashboardLink,
} from '@/components/account/account-dashboard-grid';
import { getAuthenticatedUser } from '@/lib/auth/server-session';

const ACCOUNT_LINKS: AccountDashboardLink[] = [
  {
    title: 'Profile',
    href: '/account/profile',
    description: 'Name, phone, and profile picture',
    variant: 'profile',
  },
  {
    title: 'Addresses',
    href: '/account/addresses',
    description: 'Manage delivery addresses',
    variant: 'addresses',
  },
  {
    title: 'Payment Cards',
    href: '/account/cards',
    description: 'Add and manage saved cards',
    variant: 'payment-cards',
  },
  {
    title: 'Orders',
    href: '/account/orders',
    description: 'Order history and invoices',
    variant: 'orders',
  },
  {
    title: 'Quote History',
    href: '/account/quotes',
    description: 'Submitted quotation requests',
    variant: 'quote-history',
  },
  {
    title: 'Saved Quote Drafts',
    href: '/quote',
    description: 'Resume saved quote carts',
    variant: 'quote-drafts',
  },
  {
    title: 'Recently Viewed',
    href: '/account/recently-viewed',
    description: 'Products you browsed recently',
    variant: 'recently-viewed',
  },
  {
    title: 'Downloads',
    href: '/account/downloads',
    description: 'Datasheets and product documents',
    variant: 'downloads',
  },
  {
    title: 'Favourite Products',
    href: '/account/wishlist',
    description: 'Saved products',
    variant: 'favourites',
  },
  {
    title: 'Delivery Tracking',
    href: '/account/tracking',
    description: 'Track shipments by order or tracking number',
    variant: 'tracking',
  },
  {
    title: 'Cart',
    href: '/account/cart',
    description: 'Review items before checkout',
    variant: 'cart',
  },
  {
    title: 'Checkout',
    href: '/account/checkout',
    description: 'Review order before payment',
    variant: 'checkout',
  },
  {
    title: 'Payment',
    href: '/account/payment',
    description: 'Complete payment securely',
    variant: 'payment',
  },
  {
    title: 'Notifications',
    href: '/account/notifications',
    description: 'Email and order updates',
    variant: 'notifications',
  },
  {
    title: 'Support Tickets',
    href: '/account/tickets',
    description: 'Get help from our team',
    variant: 'support-tickets',
  },
  {
    title: 'Suggestion Box',
    href: '/account/suggestions',
    description: 'Share product ideas',
    variant: 'suggestions',
  },
  {
    title: 'Password',
    href: '/account/password',
    description: 'Change your password',
    variant: 'password',
  },
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

      <AccountDashboardGrid links={ACCOUNT_LINKS} />
    </div>
  );
}
