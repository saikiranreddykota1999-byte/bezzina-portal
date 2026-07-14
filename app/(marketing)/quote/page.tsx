import { ContentPage } from '@/components/layout/content-page';
import { QuoteCartContent } from '@/components/quote/QuoteCartContent';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getQuoteDrafts } from '@/actions/quote-drafts';

export async function generateMetadata() {
  return buildPageMetadata({
    path: '/quote',
    fallbackTitle: 'Ask for quote | Joseph Bezzina & Co Ltd',
    fallbackDescription: 'Review your quote cart and submit a multi-product quotation request.',
  });
}

export default async function QuotePage() {
  const draftsResult = await getQuoteDrafts();
  const drafts = draftsResult.success ? draftsResult.data ?? [] : [];

  return (
    <ContentPage
      title="Ask for quote"
      description="Review products you want to quote, adjust quantities, and send your request to our sales team."
    >
      <QuoteCartContent drafts={drafts} />
    </ContentPage>
  );
}
