import { ContactPageContent } from '@/components/contact/contact-page-content';
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

function resolveMapEmbedUrl(value?: string | null): string {
  const trimmed = value?.trim();
  return trimmed || company.maps.embedUrl;
}

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
  const mapEmbedUrl = resolveMapEmbedUrl(primaryOffice.mapEmbedUrl);
  const mapAddress =
    primaryOffice.address ||
    `${company.address.line1}, ${company.address.city}, ${company.address.postalCode}`;

  const localBusinessSchema = getLocalBusinessSchema({
    name: companySettings.name ?? primaryOffice.name,
    imageUrl: companySettings.logoUrl ?? company.logoUrl,
    telephone: primaryOffice.phone ?? companySettings.phone ?? company.contact.phone1,
  });

  return (
    <>
      <JsonLd data={localBusinessSchema} />
      <ContactPageContent
        facebookUrl={facebookUrl}
        registrationNumber={company.registrationNumber}
        mapEmbedUrl={mapEmbedUrl}
        mapsUrl={company.maps.shortUrl}
        placeName={primaryOffice.name}
        mapAddress={mapAddress}
        offices={offices}
        businessHours={settings.businessHours}
        emergencyContact={settings.emergencyContact}
        whatsapp={settings.whatsapp ?? company.contact.whatsapp}
      />
    </>
  );
}
