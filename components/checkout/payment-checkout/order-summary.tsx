import { formatPrice, resolveQuoteLinePrice } from '@/lib/pricing';
import type { CartItem } from '@/types/user';

type Props = {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  vat?: number;
  net?: number;
  isPickup: boolean;
  onBack: () => void;
};

export function CheckoutOrderSummary({
  items,
  subtotal,
  shipping,
  total,
  vat,
  net,
  isPickup,
  onBack,
}: Props) {
  return (
    <aside className="lg:col-span-2">
      <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Order summary</h2>
        <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto text-sm text-slate-600">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-2">
              <span className="truncate">
                {item.quantity}× {item.name}
              </span>
              <span className="shrink-0">
                {formatPrice(resolveQuoteLinePrice(item.price) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Subtotal (incl. VAT)</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">{isPickup ? 'Pickup fee' : 'Shipping'}</dt>
            <dd>{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
          </div>
          {typeof net === 'number' && typeof vat === 'number' && (
            <>
              <div className="flex justify-between">
                <dt className="text-slate-500">Net</dt>
                <dd>{formatPrice(net)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">VAT (18%)</dt>
                <dd>{formatPrice(vat)}</dd>
              </div>
            </>
          )}
          <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold text-slate-900">
            <dt>Total</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={onBack}
          className="mt-6 w-full text-center text-sm text-slate-500 hover:text-slate-900"
        >
          Back to checkout
        </button>
      </div>
    </aside>
  );
}
