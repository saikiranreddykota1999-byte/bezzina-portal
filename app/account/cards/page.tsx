'use client';

import { AddCardForm, SavedCardsList } from '@/components/account/payment-card-form';

export default function CardsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Payment Cards</h1>
      <p className="mt-1 text-sm text-slate-500">
        Add and manage your saved payment methods for faster checkout.
      </p>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Saved cards
          </h2>
          <SavedCardsList />
        </section>

        <AddCardForm />
      </div>
    </div>
  );
}
