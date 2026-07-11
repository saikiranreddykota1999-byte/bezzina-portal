import { ContentPage } from '@/components/layout/content-page';
import { QuoteCartContent } from '@/components/quote/QuoteCartContent';

export const metadata = {
  title: 'Request a Quote | Joseph Bezzina & Co Ltd',
  description: 'Review your quote cart and submit a multi-product quotation request.',
};

export default function QuotePage() {
  return (
    <ContentPage
      title="Request a Quote"
      description="Add products to your quote cart, adjust quantities, and submit your request to our sales team or send via WhatsApp."
    >
      <QuoteCartContent />
    </ContentPage>
  );
}
