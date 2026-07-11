import { isDemoMode } from '@/config/demo';

export function DemoModeBanner() {
  if (!isDemoMode) return null;

  return (
    <div
      role="status"
      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      <p className="font-semibold">Demo mode</p>
      <p className="mt-1 text-amber-800">
        Stripe keys are not configured. Payments are simulated for demonstration only.
      </p>
    </div>
  );
}
