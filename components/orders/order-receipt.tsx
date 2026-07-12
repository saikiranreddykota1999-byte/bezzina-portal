'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Printer } from 'lucide-react';
import { TaxInvoiceDocument } from '@/components/orders/tax-invoice-document';
import { exportInvoicePdf } from '@/lib/receipt-pdf';
import type { OrderWithPickup } from '@/types/pickup';

type Props = {
  order: OrderWithPickup;
};

export function OrderReceipt({ order }: Props) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const filename = `invoice-${order.order_number ?? 'order'}.pdf`;

  async function handleDownloadPdf() {
    setExporting(true);
    setError('');

    try {
      await exportInvoicePdf({ filename, action: 'save' });
    } catch (exportError) {
      setError(
        exportError instanceof Error ? exportError.message : 'Unable to generate invoice PDF',
      );
    } finally {
      setExporting(false);
    }
  }

  async function handlePrintReceipt() {
    setExporting(true);
    setError('');

    try {
      await exportInvoicePdf({ filename, action: 'open' });
    } catch (exportError) {
      setError(
        exportError instanceof Error ? exportError.message : 'Unable to open invoice for printing',
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <div id="order-receipt" className="mx-auto max-w-4xl">
      <div className="no-print mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handlePrintReceipt}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <Printer className="h-4 w-4" aria-hidden />
          {exporting ? 'Preparing...' : 'Print receipt'}
        </button>
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
        >
          <Download className="h-4 w-4" aria-hidden />
          {exporting ? 'Generating PDF...' : 'Download PDF'}
        </button>
        <p className="w-full text-xs text-slate-500">
          PDF export includes your company logo and invoice details without browser date, URL, or
          page headers.
        </p>
        {error ? (
          <p className="w-full text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <TaxInvoiceDocument order={order} />

      <p className="no-print mt-6 text-center text-sm">
        <Link href="/account/orders" className="text-orange-600 hover:underline">
          Back to orders
        </Link>
      </p>
    </div>
  );
}
