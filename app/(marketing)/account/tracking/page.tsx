import TrackingPageContent from './tracking-content';

type PageProps = {
  searchParams: Promise<{ order?: string }>;
};

export default async function TrackingPage({ searchParams }: PageProps) {
  const { order } = await searchParams;

  return <TrackingPageContent initialOrder={order ?? ''} />;
}
