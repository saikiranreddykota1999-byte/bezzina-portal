import { LegalDocument } from '@/components/legal/legal-document';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { termsOfService } from '@/lib/legal/content';

export async function generateMetadata() {
  return buildPageMetadata({
    path: '/terms',
    fallbackTitle: 'Terms of Service | Joseph Bezzina & Co Ltd',
    fallbackDescription: termsOfService.description,
  });
}

export default function TermsPage() {
  return (
    <LegalDocument
      title={termsOfService.title}
      description={termsOfService.description}
      lastUpdated={termsOfService.lastUpdated}
      sections={termsOfService.sections}
    />
  );
}
