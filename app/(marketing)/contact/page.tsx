import { ContentPage } from '@/components/layout/content-page';
import { ContactForm } from '@/components/contact/contact-form';
import { LocationMap } from '@/components/contact/location-map';
import { FacebookIcon } from '@/components/icons/facebook';
import { JsonLd } from '@/components/seo/json-ld';
import { getSiteSetting, getHomepageSection } from '@/services/cms.service';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getLocalBusinessSchema } from '@/lib/structuredData';
import { company } from '@/config/company';
import type { SocialSettings, CompanySettings } from '@/types/cms';

type ContactSettings = {
  offices?: Array<{
    name: string;
    address: string;
    phone?: string;
    email?: string;
    mapEmbedUrl?: string;
  }>;
  businessHours?: string;
  emergencyContact?: string;
  whatsapp?: string;
};

export async function generateMetadata() {
  return buildPageMetadata({
    path: '/contact',
    fallbackTitle: `Contact | ${company.name}`,
    fallbackDescription: 'Contact Joseph Bezzina & Co. Ltd for quotations and technical support.',
  });
}

export default async function ContactPage() {
  const defaultCompanySettings: CompanySettings = {
    name: company.name,
    tagline: company.tagline,
    email: company.contact.email,
    phone: company.contact.phone1,
    whatsapp: company.contact.whatsapp,
    address: `${company.address.line1}, ${company.address.city}, ${company.address.postalCode}, ${company.address.country}`,
    logoUrl: company.logoUrl,
  };

  const [contactSection, companySettings, socialSettings] = await Promise.all([
    getHomepageSection('contact'),
    getSiteSetting<CompanySettings>('company', defaultCompanySettings),
    getSiteSetting<SocialSettings>('social', company.social),
  ]);

  const settings = contactSection as ContactSettings;
  const facebookUrl = socialSettings.facebook?.trim() || company.social.facebook;
  const offices = settings.offices ?? [
    {
      name: company.name,
      address: `${company.address.line1}, ${company.address.city}, ${company.address.postalCode}, ${company.address.country}`,
      phone: company.contact.phone1,
      email: company.contact.email,
      mapEmbedUrl: company.maps.embedUrl,
    },
  ];

  const primaryOffice = offices[0];
  const localBusinessSchema = getLocalBusinessSchema({
    name: companySettings.name ?? primaryOffice.name,
    imageUrl: companySettings.logoUrl ?? company.logoUrl,
    telephone: primaryOffice.phone ?? companySettings.phone ?? company.contact.phone1,
  });

  return (
    <ContentPage
      title="Contact Us"
      description="Reach our team for quotations, product enquiries, and technical assistance."
    >
      <JsonLd data={localBusinessSchema} />
      <LocationMap
        embedUrl={primaryOffice.mapEmbedUrl ?? company.maps.embedUrl}
        mapsUrl={company.maps.shortUrl}
        placeName={primaryOffice.name}
        address={primaryOffice.address}
      />

      <section className="mt-10 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="contact-form-title">
        <h2 id="contact-form-title" className="text-xl font-bold text-[#071B35] sm:text-2xl">
          Send an enquiry
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Complete the form and our team will respond to your quotation or technical enquiry.
        </p>
        <div className="mt-6">
          <ContactForm />
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {offices.map((office) => (
          <address key={office.name} className="not-italic rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-700">
            <p className="font-semibold text-slate-900">{office.name}</p>
            <p className="mt-4 whitespace-pre-line">{office.address}</p>
            {office.phone && (
              <p className="mt-4">
                <a href={`tel:${office.phone}`} className="hover:text-slate-900">{office.phone}</a>
              </p>
            )}
            {office.email && (
              <p className="mt-2">
                <a href={`mailto:${office.email}`} className="hover:text-slate-900">{office.email}</a>
              </p>
            )}
          </address>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {settings.businessHours && (
          <div className="rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900">Business Hours</h3>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{settings.businessHours}</p>
          </div>
        )}
        {settings.emergencyContact && (
          <div className="rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900">Emergency Contact</h3>
            <p className="mt-2 text-sm text-slate-600">{settings.emergencyContact}</p>
          </div>
        )}
        {settings.whatsapp && (
          <div className="rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900">WhatsApp</h3>
            <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} className="mt-2 inline-block text-sm font-semibold text-[#0B3D91] hover:underline">
              Chat on WhatsApp
            </a>
          </div>
        )}
        {facebookUrl && (
          <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5">
            <h3 className="font-semibold text-slate-900">Facebook</h3>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#1877F2] transition hover:text-[#0B3D91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8EFF9] text-[#1877F2]">
                <FacebookIcon className="h-4 w-4" />
              </span>
              Follow us on Facebook
            </a>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-slate-500">
        Registration: {company.registrationNumber}
      </p>
    </ContentPage>
  );
}
