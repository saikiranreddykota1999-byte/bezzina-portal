import { JsonLd } from '@/components/seo/json-ld';
import { company } from '@/config/company';
import { buildOrganizationSchemaFromSettings } from '@/lib/structuredData';
import { getSiteSetting } from '@/services/cms.service';
import type { CompanySettings, SocialSettings } from '@/types/cms';

export async function OrganizationJsonLd() {
  const [companySettings, socialSettings] = await Promise.all([
    getSiteSetting<CompanySettings>('company', company as unknown as CompanySettings),
    getSiteSetting<SocialSettings>('social', company.social),
  ]);

  const schema = buildOrganizationSchemaFromSettings(companySettings, socialSettings);

  return <JsonLd data={schema} />;
}
