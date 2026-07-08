import { ContentPage, ContentPageActions } from '@/components/layout/content-page';

export const metadata = {
  title: 'Brands | Joseph Bezzina & Co Ltd',
  description:
    'Trusted brands supplied by Joseph Bezzina & Co. Ltd for marine and industrial applications.',
};

export default function BrandsPage() {
  return (
    <ContentPage
      title="Brands"
      description="We work with established manufacturers and distributors to supply quality products for marine, industrial, and engineering applications across Malta."
    >
      <p className="text-base leading-7 text-slate-600">
        Looking for a specific brand or product line? Contact us and we will
        confirm availability and lead times.
      </p>
      <ContentPageActions />
    </ContentPage>
  );
}
