import { LegalDocument } from '@/components/legal/legal-document';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { cookiePolicy } from '@/lib/legal/content';

export async function generateMetadata() {
  return buildPageMetadata({
    path: '/cookies',
    fallbackTitle: 'Cookie Policy | Joseph Bezzina & Co Ltd',
    fallbackDescription: cookiePolicy.description,
  });
}

export default function CookiesPage() {
  return (
    <LegalDocument
      title={cookiePolicy.title}
      description={cookiePolicy.description}
      lastUpdated={cookiePolicy.lastUpdated}
      sections={cookiePolicy.sections}
    />
  );
}
