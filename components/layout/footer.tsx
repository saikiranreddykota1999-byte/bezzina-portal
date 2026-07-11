import Link from "next/link";
import { company } from "@/config/company";
import { navigation } from "@/config/navigation";

export function Footer() {
  const quickLinks = navigation.filter((item) => item.href !== "/quote");

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <section aria-labelledby="footer-company">
          <h2 id="footer-company" className="text-lg font-semibold text-white">
            {company.name}
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
            {company.tagline}
          </p>
          <p className="mt-4 text-sm text-slate-300">
            Serving Malta with industrial, marine, and engineering supplies
            since {company.founded}.
          </p>
        </section>

        <nav aria-labelledby="footer-links">
          <h2 id="footer-links" className="text-lg font-semibold text-white">
            Quick Links
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-slate-300 transition hover:text-white"
                >
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
            <p>
              {company.address.line1}
              <br />
              {company.address.city}, {company.address.postalCode}
              <br />
              {company.address.country}
            </p>
            <p>
              <a href={`tel:${company.contact.phone1}`} className="hover:text-white">
                {company.contact.phone1}
              </a>
              <br />
              <a href={`tel:${company.contact.phone2}`} className="hover:text-white">
                {company.contact.phone2}
              </a>
            </p>
            <p>
              <a
                href={`mailto:${company.contact.email}`}
                className="hover:text-white"
              >
                {company.contact.email}
              </a>
            </p>
          </address>
        </section>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-sm text-slate-300 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
          <p>Industrial & Marine Supplies, Malta</p>
        </div>
      </div>
    </footer>
  );
}
