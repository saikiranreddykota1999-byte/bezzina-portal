import { ContentPage } from '@/components/layout/content-page';
import { getSiteSetting, getHomepageSection } from '@/services/cms.service';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { company } from '@/config/company';

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
  const [contactSection, siteCompany] = await Promise.all([
    getHomepageSection('contact'),
    getSiteSetting('company', company),
  ]);

  const settings = contactSection as ContactSettings;
  const offices = settings.offices ?? [
    {
      name: company.name,
      address: `${company.address.line1}, ${company.address.city}, ${company.address.postalCode}, ${company.address.country}`,
      phone: company.contact.phone1,
      email: company.contact.email,
    },
  ];

  return (
    <ContentPage
      title="Contact Us"
      description="Reach our team for quotations, product enquiries, and technical assistance."
    >
      <div className="grid gap-6 lg:grid-cols-2">
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
            {office.mapEmbedUrl && (
              <iframe
                title={`Map for ${office.name}`}
                src={office.mapEmbedUrl}
                className="mt-4 h-48 w-full rounded-xl border border-slate-200"
                loading="lazy"
              />
            )}
          </address>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
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
            <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} className="mt-2 inline-block text-sm text-orange-600 hover:underline">
              Chat on WhatsApp
            </a>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-slate-500">
        Registration: {(siteCompany as typeof company).registrationNumber ?? company.registrationNumber}
      </p>
    </ContentPage>
  );
}
