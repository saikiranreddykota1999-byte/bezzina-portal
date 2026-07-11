/** Default sell price for catalogue products (EUR) */
export const DEFAULT_PRODUCT_PRICE = 1.0;

export function resolveProductPrice(price: number | null | undefined): number {
  return price ?? DEFAULT_PRODUCT_PRICE;
}

export function formatPrice(amount: number): string {
  return `€${amount.toFixed(2)}`;
}
