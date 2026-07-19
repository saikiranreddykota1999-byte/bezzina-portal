import { createHash } from 'crypto';

export type FingerprintLine = {
  productId: string;
  quantity: number;
  price: number;
};

/** Stable hash binding a PaymentIntent to exact cart lines + fulfillment. */
export function buildCartFingerprint(
  items: FingerprintLine[],
  fulfillmentMethod: string,
): string {
  const normalized = [...items]
    .map((item) => `${item.productId}:${item.quantity}:${item.price.toFixed(2)}`)
    .sort()
    .join('|');

  return createHash('sha256')
    .update(`${fulfillmentMethod}|${normalized}`)
    .digest('hex')
    .slice(0, 32);
}
