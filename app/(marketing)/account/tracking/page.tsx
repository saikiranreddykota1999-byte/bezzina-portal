import { Suspense } from 'react';
import TrackingPageContent from './tracking-content';

export default function TrackingPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading...</p>}>
      <TrackingPageContent />
    </Suspense>
  );
}
