'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { ADMIN_NAV } from '@/config/admin-nav';

function titleFromSegment(segment: string) {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function AdminBreadcrumb() {
  const pathname = usePathname();
  if (pathname === '/admin') {
    return (
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <span>Dashboard</span>
      </nav>
    );
  }

  const segments = pathname.replace('/admin', '').split('/').filter(Boolean);
  const navMatch = ADMIN_NAV.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  return (
    <nav className="admin-breadcrumb" aria-label="Breadcrumb">
      <Link href="/admin">Dashboard</Link>
      {segments.map((segment, index) => {
        const href = `/admin/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;
        const label = navMatch && index === segments.length - 1 ? navMatch.title : titleFromSegment(segment);

        return (
          <span key={href} className="inline-flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            {isLast ? <span>{label}</span> : <Link href={href}>{label}</Link>}
          </span>
        );
      })}
    </nav>
  );
}
