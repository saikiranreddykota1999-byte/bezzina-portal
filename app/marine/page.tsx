import { ContentPage, ContentPageActions } from '@/components/layout/content-page';

export const metadata = {
  title: 'Marine Supplies | Joseph Bezzina & Co Ltd',
  description:
    'Marine supplies and ship chandlery for vessels, ports, and maritime operations in Malta.',
};

export default function MarinePage() {
  return (
    <ContentPage
      title="Marine Supplies"
      description="Quality products for vessel maintenance, ship chandlery, and marine operations. We support ports, fleets, and maritime contractors with dependable supply and fast quotations."
    >
      <p className="text-base leading-7 text-slate-600">
        Browse our hardware and fastener catalogue for essential fixings, or
        contact our team for specialist marine product enquiries.
      </p>
      <ContentPageActions />
    </ContentPage>
  );
}
