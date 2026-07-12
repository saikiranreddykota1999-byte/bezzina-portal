import { LegalDocument } from '@/components/legal/legal-document';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { privacyPolicy } from '@/lib/legal/content';

export async function generateMetadata() {
  return buildPageMetadata({
    path: '/privacy',
    fallbackTitle: 'Privacy Policy | Joseph Bezzina & Co Ltd',
    fallbackDescription: privacyPolicy.description,
  });
}

export default function PrivacyPage() {
  return (
    <LegalDocument
      title={privacyPolicy.title}
      description={privacyPolicy.description}
      lastUpdated={privacyPolicy.lastUpdated}
      sections={privacyPolicy.sections}
    />
  );
}
