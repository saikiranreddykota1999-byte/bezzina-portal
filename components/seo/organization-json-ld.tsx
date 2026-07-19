import { JsonLd } from '@/components/seo/json-ld';
import { company } from '@/config/company';
import {
  getDefaultCompanySettings,
  normalizeCompanySettings,
} from '@/lib/company-settings';
import {
  buildOrganizationSchemaFromSettings,
  getWebSiteSchema,
} from '@/lib/structuredData';
import { getSiteSetting } from '@/services/cms.service';
import type { CompanySettings, SocialSettings } from '@/types/cms';

export async function OrganizationJsonLd() {
  const [companySettings, socialSettings] = await Promise.all([
    getSiteSetting<CompanySettings>('company', getDefaultCompanySettings()),
    getSiteSetting<SocialSettings>('social', company.social),
  ]);

  const organization = buildOrganizationSchemaFromSettings(
    normalizeCompanySettings(companySettings),
    socialSettings,
  );
  const website = getWebSiteSchema();

  return <JsonLd data={[organization, website]} />;
}
