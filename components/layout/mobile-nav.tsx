import Link from "next/link";
import { navigation } from "@/config/navigation";

type MobileNavProps = {
  isOpen: boolean;
  pathname: string;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav({ isOpen, pathname }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <nav
      id="mobile-navigation"
      aria-label="Mobile"
      className="border-t border-slate-200 bg-white lg:hidden"
    >
      <div className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6">
        {navigation.map((item) => {
          const active = isActivePath(pathname, item.href);
          const isQuote = item.href === "/quote";

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "rounded-md px-3 py-3 text-sm font-medium transition-colors",
                isQuote
                  ? "mt-2 bg-orange-500 text-white hover:bg-orange-600"
                  : active
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
              ].join(" ")}
            >
              {item.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
