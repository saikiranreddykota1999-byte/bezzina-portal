import Link from 'next/link';
import { User, LogIn } from 'lucide-react';
import { navigation } from '@/config/navigation';
import { isActivePath } from '@/lib/navigation';
import { SearchBar } from '@/components/SearchBar';

type MobileNavProps = {
  isOpen: boolean;
  pathname: string;
  onNavigate?: () => void;
};

export function MobileNav({ isOpen, pathname, onNavigate }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <nav
      id="mobile-navigation"
      aria-label="Mobile"
      className="border-t border-slate-200 bg-white xl:hidden"
    >
      <div className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6">
        <SearchBar variant="default" placeholder="Search products…" className="mb-4 md:hidden" />

        <div className="mb-4 grid grid-cols-2 gap-2">
          <Link
            href="/account"
            onClick={onNavigate}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            <User className="h-4 w-4 text-[#0B3D91]" aria-hidden="true" />
            My Account
          </Link>
          <Link
            href="/account/login"
            onClick={onNavigate}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            <LogIn className="h-4 w-4 text-[#0B3D91]" aria-hidden="true" />
            Sign In
          </Link>
        </div>

        {navigation.map((item) => {
          const active = isActivePath(pathname, item.href);
          const isQuote = item.href === '/quote';

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={[
                'rounded-md px-3 py-3 text-sm font-medium transition-colors',
                isQuote
                  ? 'mt-2 bg-[#0B3D91] text-white hover:bg-[#09407a]'
                  : active
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
              ].join(' ')}
            >
              {item.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
