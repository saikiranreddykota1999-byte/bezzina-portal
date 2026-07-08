import { ContentPage, ContentPageActions } from '@/components/layout/content-page';

export const metadata = {
  title: 'Industrial Equipment | Joseph Bezzina & Co Ltd',
  description:
    'Industrial equipment and technical products for workshops, plants, and trade professionals in Malta.',
};

export default function IndustrialPage() {
  return (
    <ContentPage
      title="Industrial Equipment"
      description="Reliable equipment and technical products for workshops, plants, and commercial facilities. We help engineering teams source the right products for maintenance and production needs."
    >
      <p className="text-base leading-7 text-slate-600">
        Tell us what you need and our experienced team will provide pricing,
        availability, and technical guidance.
      </p>
      <ContentPageActions />
    </ContentPage>
  );
}
