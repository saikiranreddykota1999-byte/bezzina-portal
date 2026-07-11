import { ContentPage } from '@/components/layout/content-page';
import { CareersContent } from '@/components/careers/CareersContent';
import { getActiveVacancies } from '@/actions/careers';

export const metadata = {
  title: 'Careers | Joseph Bezzina & Co Ltd',
  description: 'Join Malta\'s trusted marine and industrial supply team.',
};

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
