'use client';

import { useState } from 'react';
import { CreditCard, Trash2 } from 'lucide-react';
import { useCards, formatCardNumber, maskCardNumber } from '@/context/cards-context';
import { RippleButton } from '@/components/ui/ripple-button';
import type { PaymentCard } from '@/types/payment';

const BRAND_LABELS: Record<PaymentCard['brand'], string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  other: 'Card',
};

function detectBrandFromNumber(number: string): PaymentCard['brand'] {
  const n = number.replace(/\s/g, '');
  if (n.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return 'other';
}

export function AddCardForm({ onSuccess }: { onSuccess?: () => void }) {
  const { addCard } = useCards();
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const digits = maskCardNumber(cardNumber);
    if (digits.length < 13) {
      setError('Please enter a valid card number.');
      return;
    }
    if (!expiryMonth || !expiryYear) {
      setError('Please enter the expiry date.');
      return;
    }
    if (cvv.length < 3) {
      setError('Please enter a valid CVV.');
      return;
    }

    addCard({
      cardholderName: cardholderName.trim(),
      last4: digits.slice(-4),
      brand: detectBrandFromNumber(digits),
      expiryMonth: expiryMonth.padStart(2, '0'),
      expiryYear: expiryYear.length === 2 ? `20${expiryYear}` : expiryYear,
      isDefault: setAsDefault,
    });

    setSaved(true);
    setCardholderName('');
    setCardNumber('');
    setExpiryMonth('');
    setExpiryYear('');
    setCvv('');
    onSuccess?.();
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Add payment card</h2>
      <p className="mt-1 text-sm text-slate-500">
        Cards are stored locally for demo. Production will use a secure payment provider.
      </p>

      <div className="mt-6 space-y-4">
        <input
          required
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="Name on card"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
        />
        <input
          required
          inputMode="numeric"
          value={formatCardNumber(cardNumber)}
          onChange={(e) => setCardNumber(maskCardNumber(e.target.value))}
          placeholder="Card number"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm"
        />
        <div className="grid grid-cols-3 gap-3">
          <input
            required
            inputMode="numeric"
            maxLength={2}
            value={expiryMonth}
            onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
            placeholder="MM"
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
          />
          <input
            required
            inputMode="numeric"
            maxLength={4}
            value={expiryYear}
            onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="YYYY"
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
          />
          <input
            required
            inputMode="numeric"
            maxLength={4}
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="CVV"
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
            autoComplete="cc-csc"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={setAsDefault}
            onChange={(e) => setSetAsDefault(e.target.checked)}
            className="rounded border-slate-300"
          />
          Set as default payment method
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-600">Card saved successfully.</p>}
        <RippleButton type="submit" className="w-full sm:w-auto">
          Save Card
        </RippleButton>
      </div>
    </form>
  );
}

export function SavedCardsList() {
  const { cards, removeCard, setDefaultCard } = useCards();

  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <CreditCard className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm text-slate-500">No saved cards yet.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {cards.map((card) => (
        <li
          key={card.id}
          className={`flex items-center justify-between rounded-xl border p-4 ${
            card.isDefault ? 'border-orange-300 bg-orange-50/50' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
              {BRAND_LABELS[card.brand].slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-slate-900">
                {BRAND_LABELS[card.brand]} •••• {card.last4}
              </p>
              <p className="text-sm text-slate-500">
                {card.cardholderName} · Exp {card.expiryMonth}/{card.expiryYear.slice(-2)}
              </p>
              {card.isDefault && (
                <span className="mt-1 inline-block text-xs font-medium text-orange-600">Default</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!card.isDefault && (
              <button
                type="button"
                onClick={() => setDefaultCard(card.id)}
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Set default
              </button>
            )}
            <button
              type="button"
              onClick={() => removeCard(card.id)}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Remove card"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
