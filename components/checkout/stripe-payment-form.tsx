'use client';

import { useState } from 'react';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import type { StripeError } from '@stripe/stripe-js';
import { ShieldCheck } from 'lucide-react';
import { getStripePromise } from '@/lib/stripe/client';
import { formatPrice } from '@/lib/pricing';

function formatStripeError(error: StripeError): string {
  const parts = [error.message];
  if (error.decline_code) parts.push(`Decline: ${error.decline_code}`);
  if (error.code && error.code !== error.decline_code) parts.push(`Code: ${error.code}`);
  if (error.type) parts.push(`Type: ${error.type}`);
  return parts.filter(Boolean).join(' — ');
}

type StripeCheckoutFormProps = {
  total: number;
  disabled?: boolean;
  onPay: (paymentIntentId: string) => Promise<{ success: boolean; error?: string }>;
};

function StripeCheckoutForm({ total, disabled, onPay }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [elementReady, setElementReady] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || disabled || !elementReady) {
      setError('Payment form is still loading. Please wait a moment.');
      return;
    }

    setProcessing(true);
    setError('');

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/account/payment?paid=1`,
      },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(formatStripeError(confirmError));
      setProcessing(false);
      return;
    }

    const intentId = paymentIntent?.id;
    if (!intentId) {
      setError('Payment could not be confirmed. Please refresh and try again.');
      setProcessing(false);
      return;
    }

    // requires_capture is not treated as paid; only succeeded/processing may place an order.
    const validStatuses = ['succeeded', 'processing'];
    if (!validStatuses.includes(paymentIntent.status)) {
      setError(
        paymentIntent.status === 'requires_capture'
          ? 'Payment was authorized but not captured. Please use a different payment method.'
          : `Payment was not completed (status: ${paymentIntent.status}).`,
      );
      setProcessing(false);
      return;
    }

    const result = await onPay(intentId);
    if (!result.success) {
      setError(result.error ?? 'Payment succeeded but order could not be placed. Contact support.');
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-slate-500">
        Pay with card, Revolut Pay, or net banking (Bancontact, EPS, iDEAL, MB WAY, and more).
      </p>
      <PaymentElement
        onReady={() => setElementReady(true)}
        options={{
          layout: 'tabs',
        }}
      />
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || !elements || !elementReady || processing || disabled}
        className="relative w-full overflow-hidden rounded-full bg-orange-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {processing ? 'Processing...' : !elementReady ? 'Loading payment form...' : `Pay ${formatPrice(total)}`}
      </button>
      <p className="flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="h-4 w-4 text-green-600" />
        Secured by Stripe. Card, Revolut, and bank payments are supported.
      </p>
    </form>
  );
}

type Props = {
  clientSecret: string;
  total: number;
  disabled?: boolean;
  onPay: (paymentIntentId: string) => Promise<{ success: boolean; error?: string }>;
};

export function StripePaymentSection({ clientSecret, total, disabled, onPay }: Props) {
  const stripePromise = getStripePromise();
  if (!stripePromise) return null;

  return (
    <Elements
      key={clientSecret}
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#f97316',
            borderRadius: '12px',
          },
        },
      }}
    >
      <StripeCheckoutForm total={total} disabled={disabled} onPay={onPay} />
    </Elements>
  );
}
