import Link from 'next/link';
import { company } from '@/config/company';
import { navigation } from '@/config/navigation';
import { getHomepageSection, getSiteSetting } from '@/services/cms.service';
import type { FooterContent, CompanySettings } from '@/types/cms';

function formatAddress(address: unknown): string {
  if (typeof address === 'string' && address.trim()) return address;
  if (address && typeof address === 'object') {
    const record = address as Record<string, string | undefined>;
    return [record.line1, record.city, record.postalCode, record.country].filter(Boolean).join(', ');
  }
  return `${company.address.line1}, ${company.address.city}, ${company.address.postalCode}, ${company.address.country}`;
}

export async function Footer() {
  const [footerSection, siteCompany] = await Promise.all([
    getHomepageSection('footer'),
    getSiteSetting('company', company as unknown as CompanySettings),
  ]);

  const footer = footerSection as Partial<FooterContent>;
  const settings = siteCompany as CompanySettings;
  const quickLinks = navigation.filter((item) => item.href !== '/quote');

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <section aria-labelledby="footer-company">
          <h2 id="footer-company" className="text-lg font-semibold text-white">
            {settings.name ?? company.name}
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
            {footer.tagline ?? settings.tagline ?? company.tagline}
          </p>
          <p className="mt-4 text-sm text-slate-300">
            {footer.about ??
              `Serving Malta with industrial, marine, and engineering supplies since ${company.founded}.`}
          </p>
        </section>

        <nav aria-labelledby="footer-links">
          <h2 id="footer-links" className="text-lg font-semibold text-white">
            Quick Links
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-slate-300 transition hover:text-white">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-labelledby="footer-contact">
          <h2 id="footer-contact" className="text-lg font-semibold text-white">
            Contact
          </h2>
          <address className="mt-4 space-y-3 text-sm not-italic text-slate-300">
            <p>{formatAddress(settings.address)}</p>
            <p>
              <a href={`tel:${settings.phone ?? company.contact.phone1}`} className="hover:text-white">
                {settings.phone ?? company.contact.phone1}
              </a>
            </p>
            <p>
              <a href={`mailto:${settings.email ?? company.contact.email}`} className="hover:text-white">
                {settings.email ?? company.contact.email}
              </a>
            </p>
          </address>
        </section>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-sm text-slate-300 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>
            {footer.copyright ??
              `© ${new Date().getFullYear()} ${settings.name ?? company.name}. All rights reserved.`}
          </p>
          <p>Industrial & Marine Supplies, Malta</p>
        </div>
      </div>
    </footer>
  );
}
