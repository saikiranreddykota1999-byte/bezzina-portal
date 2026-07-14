import { CareersPageContent } from '@/components/careers/careers-page-content';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getActiveVacancies } from '@/actions/careers';

export async function generateMetadata() {
  return buildPageMetadata({
    path: '/careers',
    fallbackTitle: 'Careers | Joseph Bezzina & Co Ltd',
    fallbackDescription: "Join Malta's trusted marine and industrial supply team.",
  });
}

export default async function CareersPage() {
  const vacancies = await getActiveVacancies();
  return <CareersPageContent vacancies={vacancies} />;
}
