import { INVENTORY_STATUS_OPTIONS } from '@/types/product';

/** Default sell price for catalogue products (EUR) — only used when price is explicitly set */
export const DEFAULT_PRODUCT_PRICE = 1.0;

export function resolveProductPrice(price: number | null | undefined): number | null {
  if (price == null) return null;
  return price;
}

/** Use zero for cart/quote calculations when catalogue has no list price */
export function resolveQuoteLinePrice(price: number | null | undefined): number {
  return price ?? 0;
}

export function isQuoteOnlyProduct(price: number | null | undefined): boolean {
  return price == null;
}

export function formatPrice(amount: number): string {
  return `€${amount.toFixed(2)}`;
}

export function formatCataloguePrice(price: number | null | undefined): string | null {
  if (price == null) return null;
  return formatPrice(price);
}

export function formatAvailabilityLabel(
  availability?: string | null,
  inStock = true,
): string {
  if (availability === 'available' || (!availability && inStock)) {
    return 'Available';
  }
  if (availability === 'out_of_stock' || !inStock) {
    return 'Request Availability';
  }

  const match = INVENTORY_STATUS_OPTIONS.find((option) => option.value === availability);
  if (match?.value === 'available') return 'Available';
  if (match?.value === 'out_of_stock') return 'Request Availability';
  return match?.label ?? 'Request Availability';
}
