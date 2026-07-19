/** Malta standard VAT rate for B2B receipts */
import type { User } from '@supabase/supabase-js';
import type { ReceiptCustomer } from '@/types/pickup';

export const MALTA_VAT_RATE = 0.18;

export function splitVatInclusive(amount: number, rate = MALTA_VAT_RATE) {
  const gross = roundMoney(amount);
  const net = roundMoney(gross / (1 + rate));
  const vat = roundMoney(gross - net);
  return { net, vat, gross };
}

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

type ProfileSlice = {
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  contact_email?: string | null;
  billing_address?: string | null;
  company_name?: string | null;
  vat_number?: string | null;
};

type OrderCustomerSnapshot = {
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  customer_company_name?: string | null;
  customer_vat_number?: string | null;
  customer_address?: string | null;
};

function pickString(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

export function isSyntheticPhoneEmail(email: string | null | undefined): boolean {
  return Boolean(email?.includes('@phone.otp.bezzina'));
}

export function resolveContactEmail(
  ...values: Array<string | null | undefined>
): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed && !isSyntheticPhoneEmail(trimmed)) {
      return trimmed;
    }
  }
  return '';
}

export function displayCustomerEmail(email: string | null | undefined): string {
  const resolved = resolveContactEmail(email);
  return resolved || '—';
}

export function resolveReceiptCustomer(
  order: OrderCustomerSnapshot,
  profile: ProfileSlice | null,
  user: User | null,
): ReceiptCustomer {
  const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const metaName = typeof metadata.full_name === 'string' ? metadata.full_name : null;
  const metaPhone = typeof metadata.phone === 'string' ? metadata.phone : null;
  const metaContactEmail =
    typeof metadata.contact_email === 'string' ? metadata.contact_email : null;

  return {
    full_name: pickString(profile?.full_name, order.customer_name, metaName),
    phone: pickString(profile?.phone, order.customer_phone, user?.phone, metaPhone),
    email: resolveContactEmail(
      profile?.contact_email,
      profile?.email,
      order.customer_email,
      metaContactEmail,
      user?.email,
    ),
    address: pickString(profile?.billing_address, order.customer_address),
    company_name: pickString(profile?.company_name, order.customer_company_name),
    vat_number: pickString(profile?.vat_number, order.customer_vat_number),
  };
}

export function displayValue(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : '—';
}

const INVOICE_NUMBER_PATTERN = /^JB-\d{4}-\d{4}$/;

export function formatInvoiceNumber(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return '—';
  return INVOICE_NUMBER_PATTERN.test(trimmed) ? trimmed : trimmed.toUpperCase();
}

export function formatReceiptDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoDate));
}

export function formatReceiptTime(isoDate: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(isoDate));
}

export function formatPaymentMethodLabel(method: string | null | undefined): string {
  switch (method) {
    case 'stripe':
      return 'Stripe';
    case 'cash_on_pickup':
      return 'Cash on pickup';
    case 'card':
      return 'Card';
    default:
      return method ?? '—';
  }
}

export function formatPaymentStatusLabel(
  status: string | null | undefined,
  method: string | null | undefined,
): string {
  if (status === 'paid') return 'PAID IN FULL';
  if (status === 'processing') return 'PAYMENT PROCESSING';
  if (method === 'cash_on_pickup' && status === 'pending') return 'PAY ON PICKUP';
  if (status === 'pending') return 'PAYMENT PENDING';
  if (status === 'failed') return 'PAYMENT FAILED';
  if (status === 'refunded') return 'REFUNDED';
  return (status ?? 'pending').toUpperCase();
}

export function buildSoldToAddress(
  order: {
    customer_address?: string | null;
    shipping_formatted_address?: string | null;
    shipping_line1?: string | null;
    shipping_city?: string | null;
    shipping_postal_code?: string | null;
    shipping_country?: string | null;
  },
  customerAddress?: string | null,
): string {
  const savedAddress = pickString(order.customer_address, customerAddress);
  if (savedAddress) return savedAddress;
  return buildCustomerAddress(order);
}

export function buildCustomerAddress(order: {
  shipping_formatted_address?: string | null;
  shipping_line1?: string | null;
  shipping_city?: string | null;
  shipping_postal_code?: string | null;
  shipping_country?: string | null;
}): string {
  if (order.shipping_formatted_address?.trim()) {
    return order.shipping_formatted_address.trim();
  }

  const parts = [
    order.shipping_line1,
    order.shipping_city,
    order.shipping_postal_code,
    order.shipping_country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : '—';
}

const BELOW_TWENTY = [
  'Zero',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertBelowThousand(value: number): string {
  if (value < 20) return BELOW_TWENTY[value];
  if (value < 100) {
    const tens = Math.floor(value / 10);
    const ones = value % 10;
    return ones ? `${TENS[tens]} ${BELOW_TWENTY[ones]}` : TENS[tens];
  }

  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;
  const hundredPart = `${BELOW_TWENTY[hundreds]} Hundred`;
  return remainder ? `${hundredPart} ${convertBelowThousand(remainder)}` : hundredPart;
}

function convertIntegerToWords(value: number): string {
  if (value === 0) return 'Zero';
  if (value < 1000) return convertBelowThousand(value);

  const thousands = Math.floor(value / 1000);
  const remainder = value % 1000;
  const thousandPart = `${convertBelowThousand(thousands)} Thousand`;
  return remainder ? `${thousandPart} ${convertBelowThousand(remainder)}` : thousandPart;
}

export function amountInWords(amount: number): string {
  const rounded = roundMoney(amount);
  const euros = Math.floor(rounded);
  const cents = Math.round((rounded - euros) * 100);
  const euroWords = convertIntegerToWords(euros);
  const centWords = convertIntegerToWords(cents);
  return `${euroWords} Euro and ${centWords} Cent${cents === 1 ? '' : 's'}`;
}

export type ReceiptLineItem = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineGross: number;
  lineNet: number;
  lineVat: number;
};

export function buildReceiptLineItems(
  items: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    unit_price: number | null;
  }>,
): ReceiptLineItem[] {
  return items.map((item) => {
    const unitPrice = item.unit_price ?? 0;
    const lineGross = roundMoney(unitPrice * item.quantity);
    const { net, vat } = splitVatInclusive(lineGross);
    return {
      id: item.id,
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice,
      lineGross,
      lineNet: net,
      lineVat: vat,
    };
  });
}

export function buildReceiptTotals(
  subtotal: number,
  shippingCost: number,
  rate = MALTA_VAT_RATE,
) {
  const goods = splitVatInclusive(subtotal, rate);
  const shipping = splitVatInclusive(shippingCost, rate);
  const totalGross = roundMoney(subtotal + shippingCost);

  return {
    subtotalNet: goods.net,
    subtotalVat: goods.vat,
    shippingNet: shipping.net,
    shippingVat: shipping.vat,
    totalVat: roundMoney(goods.vat + shipping.vat),
    totalGross,
    totalNet: roundMoney(goods.net + shipping.net),
  };
}
