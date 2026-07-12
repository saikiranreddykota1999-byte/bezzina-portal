import Link from "next/link";
import { navigation } from "@/config/navigation";
import { isActivePath } from "@/lib/navigation";
import { SearchBar } from "@/components/SearchBar";

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
      className="border-t border-slate-200 bg-white lg:hidden"
    >
      <div className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6">
        <SearchBar variant="default" placeholder="Search products…" className="mb-4 md:hidden" />
        {navigation.map((item) => {
          const active = isActivePath(pathname, item.href);
          const isQuote = item.href === "/quote";

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={[
                "rounded-md px-3 py-3 text-sm font-medium transition-colors",
                isQuote
                  ? "mt-2 bg-[#0B3D91] text-white hover:bg-[#09407a]"
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
