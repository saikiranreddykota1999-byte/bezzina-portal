'use client';

import { company } from '@/config/company';
import { formatPickupAddress, formatPickupDateTime } from '@/lib/checkout';
import { formatPrice } from '@/lib/pricing';
import {
  amountInWords,
  buildCustomerAddress,
  buildReceiptLineItems,
  buildReceiptTotals,
  buildSoldToAddress,
  displayCustomerEmail,
  displayValue,
  formatPaymentMethodLabel,
  formatPaymentStatusLabel,
  formatReceiptDate,
  formatReceiptTime,
  MALTA_VAT_RATE,
  resolveReceiptCustomer,
} from '@/lib/receipt';
import type { OrderWithPickup } from '@/types/pickup';

type Props = {
  order: OrderWithPickup;
};

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-[11px] leading-5 text-slate-700">
      <span className="font-semibold text-slate-900">{label}:</span> {value}
    </p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{children}</p>
  );
}

function SignatureLine({ label }: { label: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-6 border-b border-slate-400" />
    </div>
  );
}

export function TaxInvoiceDocument({ order }: Props) {
  const items = order.items ?? [];
  const customer = order.customer ?? resolveReceiptCustomer(order, null, null);
  const isPickup = order.fulfillment_method === 'store_pickup';
  const lineItems = buildReceiptLineItems(items);
  const totals = buildReceiptTotals(Number(order.subtotal), Number(order.shipping_cost));
  const paymentStatus = formatPaymentStatusLabel(order.payment_status, order.payment_method);
  const isPaid = order.payment_status === 'paid';
  const companyAddress = `${company.address.line1}, ${company.address.city} ${company.address.postalCode}, ${company.address.country}`;

  return (
    <div
      id="invoice-document"
      className="relative overflow-hidden rounded-lg border border-slate-300 bg-white shadow-lg print:rounded-none print:border-slate-400 print:shadow-none"
    >
      <div className="receipt-watermark-layer" aria-hidden />

      <div className="relative z-10">
        <div className="invoice-header bg-[#0b1f3a] px-6 py-5 text-white print:bg-[#0b1f3a]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-md bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={company.logoUrl}
                  alt={`${company.name} logo`}
                  width={120}
                  height={48}
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div>
                <p className="text-lg font-bold leading-tight">{company.name}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                  {company.invoice.tagline} · EST. {company.founded}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block rounded-md bg-slate-700/80 px-4 py-2 text-xs font-bold uppercase tracking-wide">
                Tax Invoice / Receipt
              </div>
              <p className="mt-2 text-[11px] text-slate-300">
                Original Copy · {displayValue(order.order_number)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-b border-slate-200 bg-slate-100 px-6 py-3 sm:grid-cols-2">
          <div className="space-y-0.5">
            <MetaItem label="Reg. No" value={company.registrationNumber} />
            <MetaItem label="VAT" value={company.invoice.vatNumber} />
            <MetaItem label="EORI" value={company.invoice.eoriNumber} />
            <MetaItem label="Tel" value={company.contact.phone1} />
            <MetaItem label="Email" value={company.invoice.accountsEmail} />
          </div>
          <div className="space-y-0.5 sm:text-right">
            <MetaItem label="Date" value={formatReceiptDate(order.created_at)} />
            <MetaItem label="Time" value={formatReceiptTime(order.created_at)} />
            <MetaItem label="Currency" value={`${company.invoice.currency} €`} />
            <MetaItem label="Page" value="1 of 1" />
          </div>
        </div>

        <div className="grid gap-6 border-b border-slate-200 px-6 py-5 sm:grid-cols-2">
          <div>
            <SectionTitle>Sold To</SectionTitle>
            <p className="mt-2 text-sm font-bold text-slate-900">
              {displayValue(customer.full_name)}
            </p>
            <p className="text-sm text-slate-800">
              Company: {displayValue(customer.company_name)}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {buildSoldToAddress(order, customer.address)}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Email: {displayCustomerEmail(customer.email)}
            </p>
            <p className="text-sm text-slate-700">VAT: {displayValue(customer.vat_number)}</p>
            <p className="text-sm text-slate-700">Tel: {displayValue(customer.phone)}</p>
          </div>

          <div>
            <SectionTitle>{isPickup ? 'Ship To / Pickup' : 'Ship To'}</SectionTitle>
            {isPickup && order.pickup_location ? (
              <>
                <p className="mt-2 text-sm font-bold text-slate-900">{order.pickup_location.name}</p>
                <p className="text-sm text-slate-700">{formatPickupAddress(order.pickup_location)}</p>
                {order.pickup_date && order.pickup_time ? (
                  <p className="mt-3 text-sm font-semibold text-orange-600">
                    Pickup: {formatPickupDateTime(order.pickup_date, order.pickup_time)}
                  </p>
                ) : null}
                {order.pickup_code ? (
                  <div className="mt-3 inline-block rounded-md border border-orange-300 bg-orange-50 px-4 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-orange-700">
                      Pickup Code
                    </p>
                    <p className="font-mono text-lg font-bold text-slate-900">{order.pickup_code}</p>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-700">{buildCustomerAddress(order)}</p>
            )}
          </div>
        </div>

        <div className="overflow-x-auto px-6 py-4">
          <table className="w-full min-w-[640px] border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-300 text-left text-[10px] uppercase tracking-wide text-slate-500">
                <th className="pb-2 pr-3">Item / SKU</th>
                <th className="pb-2 text-center">Qty</th>
                <th className="pb-2 text-right">Unit</th>
                <th className="pb-2 text-right">Net</th>
                <th className="pb-2 text-right">VAT%</th>
                <th className="pb-2 text-right">VAT</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {lineItems.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 pr-3">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-[11px] text-slate-500">{item.sku}</p>
                  </td>
                  <td className="py-3 text-center text-slate-700">{item.quantity}</td>
                  <td className="py-3 text-right text-slate-700">{formatPrice(item.unitPrice)}</td>
                  <td className="py-3 text-right text-slate-700">{formatPrice(item.lineNet)}</td>
                  <td className="py-3 text-right text-slate-700">{MALTA_VAT_RATE * 100}%</td>
                  <td className="py-3 text-right text-slate-700">{formatPrice(item.lineVat)}</td>
                  <td className="py-3 text-right font-semibold text-slate-900">
                    {formatPrice(item.lineGross)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-6 border-t border-slate-200 px-6 py-5 sm:grid-cols-[1.2fr_0.8fr]">
          <div>
            <SectionTitle>Payment Details</SectionTitle>
            <div className="mt-3 space-y-1 text-sm text-slate-800">
              <p>
                <span className="font-semibold text-slate-900">Method:</span>{' '}
                {formatPaymentMethodLabel(order.payment_method)}
              </p>
              <p className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">Status:</span>
                <span
                  className={`inline-flex items-center gap-1.5 font-bold ${
                    isPaid ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  />
                  {paymentStatus}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-900">Transaction ID:</span>{' '}
                {displayValue(order.payment_reference)}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Auth Code:</span>{' '}
                {displayValue(order.payment_reference?.slice(-8).toUpperCase())}
              </p>
            </div>
            <p className="mt-4 text-xs italic text-slate-600">
              {isPickup
                ? 'Goods inspected and accepted in good condition at pickup.'
                : 'Goods delivered in good condition as per order confirmation.'}
            </p>
          </div>

          <div className="rounded-lg border border-slate-300 bg-slate-50 p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal (Net)</span>
                <span>{formatPrice(totals.subtotalNet)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">VAT {MALTA_VAT_RATE * 100}%</span>
                <span>{formatPrice(totals.totalVat)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{isPickup ? 'Pickup Fee' : 'Shipping'}</span>
                <span className={Number(order.shipping_cost) === 0 ? 'font-semibold text-emerald-700' : ''}>
                  {Number(order.shipping_cost) === 0 ? 'FREE' : formatPrice(Number(order.shipping_cost))}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-3 text-lg font-bold text-slate-900">
                <span>Total Amount</span>
                <span>{formatPrice(totals.totalGross)}</span>
              </div>
            </div>
            <p className="mt-3 text-[11px] italic text-slate-600">{amountInWords(totals.totalGross)}</p>
          </div>
        </div>

        {isPickup ? (
          <div className="border-t border-slate-200 px-6 py-5">
            <SectionTitle>Pickup Authorization</SectionTitle>
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              <SignatureLine label="Collected by" />
              <SignatureLine label="ID Card" />
              <SignatureLine label="Released by (Staff)" />
            </div>
          </div>
        ) : null}

        <div className="border-t border-slate-200 px-6 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Warranty & Returns
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] leading-5 text-slate-600">
                <li>Manufacturer warranty applies where stated on product documentation.</li>
                <li>Returns accepted within 14 days for unused goods in original packaging.</li>
                <li>Custom or cut-to-order items are non-returnable unless defective.</li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Terms & Conditions
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] leading-5 text-slate-600">
                <li>Payment terms as stated on invoice. Title passes on full payment.</li>
                <li>Prices include VAT at {MALTA_VAT_RATE * 100}% where applicable.</li>
                <li>Disputes subject to Maltese jurisdiction. EORI: {company.invoice.eoriNumber}.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="invoice-footer bg-[#0b1f3a] px-6 py-4 text-center text-[10px] leading-5 text-slate-300 print:bg-[#0b1f3a]">
          <p>
            {company.name} · {companyAddress} · VAT: {company.invoice.vatNumber}
          </p>
          <p className="mt-1">
            This document is generated electronically and is valid without signature. GDPR: your data
            is processed per our privacy policy at {company.contact.website}.
          </p>
          <p className="mt-2 font-semibold text-white">
            Thank you for choosing {company.name} — Your trusted partner in marine supplies.
          </p>
        </div>
      </div>
    </div>
  );
}
