import { ComparePageClient } from '@/components/products/compare-page-client';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return buildPageMetadata({
    path: '/products/compare',
    fallbackTitle: 'Compare Products | Joseph Bezzina & Co Ltd',
    fallbackDescription: 'Compare industrial and marine products side by side.',
    robots: { index: false, follow: false },
  });
}

export default function CompareProductsPage() {
  return <ComparePageClient />;
}
