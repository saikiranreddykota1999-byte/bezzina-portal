'use client';

import { Banknote, CreditCard } from 'lucide-react';

export type CheckoutPaymentMode = 'online' | 'cash_on_pickup';

type Props = {
  value: CheckoutPaymentMode;
  onChange: (mode: CheckoutPaymentMode) => void;
  showCashOption: boolean;
};

export function PaymentMethodSelector({ value, onChange, showCashOption }: Props) {
  return (
    <div className="space-y-3">
      <label
        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
          value === 'online'
            ? 'border-orange-400 bg-orange-50/50'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <input
          type="radio"
          name="payment-mode"
          checked={value === 'online'}
          onChange={() => onChange('online')}
          className="mt-1 text-orange-500"
        />
        <div>
          <div className="flex items-center gap-2 font-medium text-slate-900">
            <CreditCard className="h-4 w-4 text-orange-500" />
            Pay online
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Card, Revolut Pay, Bancontact, EPS, iDEAL, MB WAY, and other bank options.
          </p>
        </div>
      </label>

      {showCashOption && (
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
            value === 'cash_on_pickup'
              ? 'border-orange-400 bg-orange-50/50'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <input
            type="radio"
            name="payment-mode"
            checked={value === 'cash_on_pickup'}
            onChange={() => onChange('cash_on_pickup')}
            className="mt-1 text-orange-500"
          />
          <div>
            <div className="flex items-center gap-2 font-medium text-slate-900">
              <Banknote className="h-4 w-4 text-orange-500" />
              Cash on pickup
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Pay in cash when you collect your order at the store. No online payment required.
            </p>
          </div>
        </label>
      )}
    </div>
  );
}
