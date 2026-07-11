import { ContentPage, ContentPageActions } from '@/components/layout/content-page';

export const metadata = {
  title: 'About Us | Joseph Bezzina & Co Ltd',
  description:
    'Learn about Joseph Bezzina & Co. Ltd, Malta\'s trusted marine and industrial supplier since 1969.',
};

export default function AboutPage() {
  return (
    <ContentPage
      title="About Us"
      description="Joseph Bezzina & Co. Ltd has been serving Malta with industrial, marine, and engineering supplies since 1969. We combine dependable sourcing with practical expertise to support vessels, workshops, plants, and trade professionals across the island."
    >
      <p className="text-base leading-7 text-slate-600">
        From fasteners and hardware to marine chandlery and industrial equipment,
        our team focuses on responsive service, reliable stock, and technical
        support you can count on.
      </p>
      <ContentPageActions />
    </ContentPage>
  );
}
