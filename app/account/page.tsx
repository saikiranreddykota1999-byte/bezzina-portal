import Link from 'next/link';

const ACCOUNT_LINKS = [
  { title: 'Profile', href: '/account/profile', description: 'Name, phone, and profile picture' },
  { title: 'Addresses', href: '/account/addresses', description: 'Manage delivery addresses' },
  { title: 'Payment Cards', href: '/account/cards', description: 'Add and manage saved cards' },
  { title: 'Orders', href: '/account/orders', description: 'Order history and invoices' },
  { title: 'Delivery Tracking', href: '/account/tracking', description: 'Track shipments by order or tracking number' },
  { title: 'Wishlist', href: '/account/wishlist', description: 'Saved products' },
  { title: 'Cart', href: '/account/cart', description: 'Review items before checkout' },
  { title: 'Checkout', href: '/account/checkout', description: 'Review order before payment' },
  { title: 'Payment', href: '/account/payment', description: 'Complete payment securely' },
  { title: 'Notifications', href: '/account/notifications', description: 'Email and order updates' },
  { title: 'Support Tickets', href: '/account/tickets', description: 'Get help from our team' },
  { title: 'Suggestion Box', href: '/account/suggestions', description: 'Share product ideas' },
  { title: 'Password', href: '/account/password', description: 'Change your password' },
];

export default function AccountDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My Account</h1>
      <p className="mt-1 text-sm text-slate-500">Manage your profile, orders, and preferences.</p>

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
