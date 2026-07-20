'use client';

import { formatCardNumber, maskCardNumber } from '@/lib/payment/card-format';

type PaymentFormValues = {
  cardholderName: string;
  cardNumber: string;
};

type Props = {
  values: PaymentFormValues;
  onChange: (values: PaymentFormValues) => void;
};

const inputClass =
  'w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500';

export function InlinePaymentForm({ values, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="cardholder" className="mb-1.5 block text-sm font-medium text-slate-700">
          Cardholder name
        </label>
        <input
          id="cardholder"
          type="text"
          autoComplete="cc-name"
          value={values.cardholderName}
          onChange={(e) => onChange({ ...values, cardholderName: e.target.value })}
          placeholder="Name on card"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="card-number" className="mb-1.5 block text-sm font-medium text-slate-700">
          Card number
        </label>
        <input
          id="card-number"
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          value={formatCardNumber(values.cardNumber)}
          onChange={(e) => onChange({ ...values, cardNumber: maskCardNumber(e.target.value) })}
          placeholder="1234 5678 9012 3456"
          className={inputClass}
        />
      </div>
      <p className="text-xs text-slate-500">
        Demo payment — card details are not sent to a payment processor.
      </p>
    </div>
  );
}

export function getCardLast4(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  return digits.slice(-4);
}
