'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, User, ClipboardList, Phone } from 'lucide-react';
import { navigation } from '@/config/navigation';
import { company } from '@/config/company';
import { brandClasses } from '@/lib/brand';
import { isActivePath } from '@/lib/navigation';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { useQuoteCart } from '@/context/quote-cart-context';
import { QuoteCartDrawer } from '@/components/quote/quote-cart-drawer';
import { SearchBar } from '@/components/SearchBar';
import { AnimatedLogo } from '@/components/brand/AnimatedLogo';
import { MobileNav } from './mobile-nav';

const NAV_EXCLUDED = new Set(['/quote', '/search']);

export function Header() {
  const pathname = usePathname();
  const { count: cartCount } = useCart();
  const { count: quoteCount } = useQuoteCart();
  const { items: wishlistItems } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [quoteDrawerOpen, setQuoteDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMobileNav = () => setIsMobileOpen(false);

  const navLinks = useMemo(
    () => navigation.filter((item) => !NAV_EXCLUDED.has(item.href)),
    [],
  );

  const quoteLink = useMemo(
    () => navigation.find((item) => item.href === '/quote'),
    [],
  );

  return (
    <header
      className={[
        'site-chrome sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur transition-shadow',
        isScrolled ? 'shadow-md shadow-[#0B3D91]/5' : 'shadow-none',
      ].join(' ')}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center gap-4 px-4 sm:gap-5 sm:px-6 lg:h-[5rem] lg:px-8">
        <AnimatedLogo
          variant="header-desktop"
          href="/"
          showCompanyName
          hoverable
          priority
          companyNameClassName="hidden md:block max-w-[11rem] lg:max-w-[15rem]"
        />

        <div className="hidden min-w-0 flex-1 md:block lg:max-w-xs xl:max-w-sm">
          <SearchBar variant="header" placeholder="Search products…" className="w-full" />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1.5">
          <a
            href={`tel:${company.contact.phone1.replace(/\s/g, '')}`}
            className="hidden items-center gap-1.5 rounded-md p-2 text-slate-700 transition hover:bg-slate-50 2xl:inline-flex"
            aria-label={`Call ${company.contact.phone1}`}
          >
            <Phone className="h-4 w-4 shrink-0 text-[#0B3D91]" aria-hidden="true" />
            <span className="text-sm font-medium">{company.contact.phone1}</span>
          </a>

          <button
            type="button"
            onClick={() => setQuoteDrawerOpen(true)}
            className="relative rounded-md p-2 text-slate-700 transition hover:bg-slate-50"
            aria-label="Quote cart"
          >
            <ClipboardList className="h-5 w-5" />
            {quoteCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0B3D91] text-[10px] font-bold text-white">
                {quoteCount}
              </span>
            )}
          </button>

          <Link
            href="/account/wishlist"
            className="relative hidden rounded-md p-2 text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlistItems.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0B3D91] text-[10px] font-bold text-white">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          <Link
            href="/account/cart"
            className="relative rounded-md p-2 text-slate-700 transition hover:bg-slate-50"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0B3D91] text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            href="/account"
            className="hidden rounded-md p-2 text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>

          {quoteLink ? (
            <Link
              href={quoteLink.href}
              className={`hidden whitespace-nowrap sm:inline-flex ${brandClasses.btnPrimary} px-4 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm`}
            >
              <span className="hidden md:inline">Request a Quote</span>
              <span className="md:hidden">Quote</span>
            </Link>
          ) : null}

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-800 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] xl:hidden"
            aria-expanded={isMobileOpen}
            aria-controls="mobile-navigation"
            aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMobileOpen((prev) => !prev)}
          >
            <span className="sr-only">{isMobileOpen ? 'Close menu' : 'Open menu'}</span>
            <div className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
            </div>
          </button>
        </div>
      </div>

      <nav
        aria-label="Primary"
        className="hidden border-t border-slate-100 bg-[#F8FAFC]/80 xl:block"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 py-2.5 sm:px-6 lg:px-8">
          {navLinks.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'whitespace-nowrap rounded-md px-1 py-1 text-sm font-medium transition-colors',
                  active ? 'text-[#0B3D91]' : 'text-slate-700 hover:text-slate-900',
                ].join(' ')}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      </nav>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="xl:hidden"
          >
            <MobileNav
              isOpen={isMobileOpen}
              pathname={pathname}
              onNavigate={closeMobileNav}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <QuoteCartDrawer open={quoteDrawerOpen} onClose={() => setQuoteDrawerOpen(false)} />
    </header>
  );
}
