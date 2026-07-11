import { ContentPage, ContentPageActions } from '@/components/layout/content-page';

export const metadata = {
  title: 'Services | Joseph Bezzina & Co Ltd',
  description:
    'Supply, sourcing, and technical support services from Joseph Bezzina & Co. Ltd.',
};

export default function ServicesPage() {
  return (
    <ContentPage
      title="Services"
      description="Beyond product supply, we support customers with quotations, sourcing, and practical technical assistance for marine and industrial requirements."
    >
      <ul className="list-disc space-y-2 pl-5 text-base leading-7 text-slate-600">
        <li>Fast quotations for trade and commercial customers</li>
        <li>Product sourcing across marine and industrial categories</li>
        <li>Technical guidance for fasteners, hardware, and equipment</li>
        <li>Reliable delivery and collection from our Marsa premises</li>
      </ul>
      <ContentPageActions />
    </ContentPage>
  );
}
