import { PublicTrackContent } from '@/components/track/public-track-content';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return buildPageMetadata({
    path: '/track',
    fallbackTitle: 'Track Delivery | Joseph Bezzina & Co Ltd',
    fallbackDescription: 'Track your Joseph Bezzina order or delivery status.',
  });
}

export default function PublicTrackPage() {
  return <PublicTrackContent />;
}
