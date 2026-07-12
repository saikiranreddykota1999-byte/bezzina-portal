import { ContentPage } from '@/components/layout/content-page';
import { CareersContent } from '@/components/careers/CareersContent';
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

  return (
    <ContentPage
      title="Careers"
      description="Build your career with Joseph Bezzina & Co. Ltd — Malta's marine and industrial supply partner since 1969."
    >
      <CareersContent vacancies={vacancies} />
    </ContentPage>
  );
}
