import { AboutPageContent } from '@/components/about/about-page-content';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { ABOUT_PAGE_CONTENT } from '@/lib/about/page-content';

export async function generateMetadata() {
  return buildPageMetadata({
    path: '/about',
    fallbackTitle: 'About Us | Joseph Bezzina & Co Ltd',
    fallbackDescription: ABOUT_PAGE_CONTENT.intro,
  });
}

export default function AboutPage() {
  return <AboutPageContent />;
}
