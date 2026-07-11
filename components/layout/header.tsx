'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, User, ClipboardList } from "lucide-react";
import { navigation } from "@/config/navigation";
import { company } from "@/config/company";
import { isActivePath } from "@/lib/navigation";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { useQuoteCart } from "@/context/quote-cart-context";
import { MobileNav } from "./mobile-nav";

export function Header() {
  const pathname = usePathname();
  const { count: cartCount } = useCart();
  const { count: quoteCount } = useQuoteCart();
  const { items: wishlistItems } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobileNav = () => setIsMobileOpen(false);

  const quoteLink = useMemo(
    () => navigation.find((item) => item.href === "/quote"),
    [],
  );

  const desktopLinks = useMemo(
    () => navigation.filter((item) => item.href !== "/quote"),
    [],
  );

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur transition-shadow",
        isScrolled ? "shadow-sm" : "shadow-none",
      ].join(" ")}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          aria-label={`${company.name} home`}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
            JB
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-none text-slate-900">
              {company.name}
            </p>
            <p className="mt-1 text-xs text-slate-600">{company.tagline}</p>
          </div>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 xl:gap-8 lg:flex">
          {desktopLinks.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "text-sm font-medium transition-colors",
                  active ? "text-slate-900" : "text-slate-700 hover:text-slate-900",
                ].join(" ")}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/quote"
            className="relative rounded-md p-2 text-slate-700 transition hover:bg-slate-50"
            aria-label="Quote cart"
          >
            <ClipboardList className="h-5 w-5" />
            {quoteCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                {quoteCount}
              </span>
            )}
          </Link>

          <Link
            href="/account/wishlist"
            className="relative hidden rounded-md p-2 text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlistItems.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
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
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
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
              className="hidden rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 sm:inline-flex"
            >
              Request a Quote
            </Link>
          ) : null}

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-200 text-slate-800 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 lg:hidden"
            aria-expanded={isMobileOpen}
            aria-controls="mobile-navigation"
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMobileOpen((prev) => !prev)}
          >
            <span className="sr-only">{isMobileOpen ? "Close menu" : "Open menu"}</span>
            <div className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <MobileNav
              isOpen={isMobileOpen}
              pathname={pathname}
              onNavigate={closeMobileNav}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
