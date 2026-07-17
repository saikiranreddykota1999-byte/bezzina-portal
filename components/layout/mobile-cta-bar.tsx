'use client';

import Link from 'next/link';
import { ClipboardList, MessageCircle, Phone } from 'lucide-react';
import { company } from '@/config/company';
import { brandClasses } from '@/lib/brand';

export function MobileCtaBar() {
  const phoneHref = `tel:${company.contact.phone1.replace(/\s/g, '')}`;
  const whatsappNumber = company.contact.whatsapp?.replace(/\D/g, '');
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null;

  return (
    <div
      className="site-chrome fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur md:hidden"
      role="region"
      aria-label="Quick actions"
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
        <Link href="/quote" className={`${brandClasses.btnPrimary} flex-1 gap-1.5 px-3 py-2.5 text-xs`}>
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Quote
        </Link>
        <a
          href={phoneHref}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-300 px-3 py-2.5 text-xs font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
        >
          <Phone className="h-4 w-4 text-[#0B3D91]" aria-hidden="true" />
          Call
        </a>
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            WhatsApp
          </a>
        ) : null}
      </div>
    </div>
  );
}
