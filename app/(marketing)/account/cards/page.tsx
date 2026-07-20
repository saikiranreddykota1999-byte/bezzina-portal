import Link from 'next/link';
import { CreditCard } from 'lucide-react';
import { brandClasses } from '@/lib/brand';

export default function CardsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Payment Cards</h1>
      <p className="mt-1 text-sm text-slate-500">
        Saved card storage has been removed for security.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B3D91]/10 text-[#0B3D91]">
            <CreditCard className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-slate-900">Use secure checkout instead</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Card details are no longer stored in the browser. Pay safely during checkout with
              Stripe (or cash on pickup where available).
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/account/payment" className={brandClasses.btnPrimary}>
                Go to payment
              </Link>
              <Link href="/account" className={brandClasses.btnSecondary}>
                Back to account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
