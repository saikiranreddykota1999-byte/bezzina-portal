import { ContactPageContent } from '@/components/contact/contact-page-content';
import { JsonLd } from '@/components/seo/json-ld';
import { getSiteSetting, getHomepageSection } from '@/services/cms.service';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getLocalBusinessSchema } from '@/lib/structuredData';
import {
  formatCompanyAddress,
  getDefaultCompanySettings,
  normalizeCompanySettings,
} from '@/lib/company-settings';
import { company } from '@/config/company';
import type { SocialSettings, CompanySettings } from '@/types/cms';

type ContactSettings = {
  offices?: Array<{
    name: string;
    address: string | Record<string, unknown>;
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
  const [contactSection, companySettingsRaw, socialSettings] = await Promise.all([
    getHomepageSection('contact'),
    getSiteSetting<CompanySettings>('company', getDefaultCompanySettings()),
    getSiteSetting<SocialSettings>('social', company.social),
  ]);

  const companySettings = normalizeCompanySettings(companySettingsRaw);
  const settings = contactSection as ContactSettings;
  const facebookUrl = socialSettings.facebook?.trim() || company.social.facebook;
  const defaultAddress = formatCompanyAddress(company.address);
  const offices = settings.offices ?? [
    {
      name: company.name,
      address: defaultAddress,
      phone: company.contact.phone1,
      email: company.contact.email,
      mapEmbedUrl: company.maps.embedUrl,
    },
  ];

  const primaryOffice = offices[0];
  const mapEmbedUrl = resolveMapEmbedUrl(primaryOffice.mapEmbedUrl);
  const officeAddress = formatCompanyAddress(primaryOffice.address);

  const localBusinessSchema = getLocalBusinessSchema({
    name: companySettings.name ?? primaryOffice.name,
    imageUrl: companySettings.logoUrl ?? company.logoUrl,
    telephone: primaryOffice.phone ?? companySettings.phone ?? company.contact.phone1,
  });

  const addressLines = officeAddress
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <>
      <JsonLd data={localBusinessSchema} />
      <ContactPageContent
        companyName={companySettings.name ?? company.name}
        addressLines={addressLines.length > 0 ? addressLines : [defaultAddress]}
        phone1={company.contact.phone1}
        phone2={company.contact.phone2}
        email={company.contact.email}
        facebookUrl={facebookUrl}
        registrationNumber={company.registrationNumber}
        mapEmbedUrl={mapEmbedUrl}
        mapsUrl={company.maps.shortUrl}
        placeName={company.maps.placeName}
        businessHours={settings.businessHours}
        whatsapp={settings.whatsapp ?? company.contact.whatsapp}
      />
    </>
  );
}
