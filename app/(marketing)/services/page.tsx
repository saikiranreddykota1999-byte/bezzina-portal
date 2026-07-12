import { ServicesPageContent } from '@/components/services/services-page-content';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { SERVICES_PAGE_CONTENT } from '@/lib/services/page-content';

export async function generateMetadata() {
  return buildPageMetadata({
    path: '/services',
    fallbackTitle: 'Services | Joseph Bezzina & Co Ltd',
    fallbackDescription: SERVICES_PAGE_CONTENT.description,
  });
}

export default function ServicesPage() {
  return <ServicesPageContent />;
}
