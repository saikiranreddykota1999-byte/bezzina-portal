'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Loader2, Printer } from 'lucide-react';
import { TaxInvoiceDocument } from '@/components/orders/tax-invoice-document';
import { exportInvoicePdf, mapInvoicePdfError } from '@/lib/receipt-pdf';
import type { OrderWithPickup } from '@/types/pickup';

type Props = {
  order: OrderWithPickup;
};

export function OrderReceipt({ order }: Props) {
  const [exporting, setExporting] = useState(false);
  const [exportAction, setExportAction] = useState<'download' | 'print' | null>(null);
  const [error, setError] = useState('');
  const filename = `invoice-${order.order_number ?? 'order'}.pdf`;
  const invoiceReady = Boolean(order.order_number && (order.items?.length ?? 0) > 0);

  async function handleDownloadPdf() {
    if (!invoiceReady) {
      setError('Invoice not yet available for this order.');
      return;
    }

    setExporting(true);
    setExportAction('download');
    setError('');

    try {
      await exportInvoicePdf({ filename, action: 'save' });
    } catch (exportError) {
      console.error('Invoice PDF download failed:', exportError);
      setError(mapInvoicePdfError(exportError));
    } finally {
      setExporting(false);
      setExportAction(null);
    }
  }

  async function handlePrintReceipt() {
    if (!invoiceReady) {
      setError('Invoice not yet available for this order.');
      return;
    }

    setExporting(true);
    setExportAction('print');
    setError('');

    try {
      await exportInvoicePdf({ filename, action: 'open' });
    } catch (exportError) {
      console.error('Invoice PDF print failed:', exportError);
      setError(mapInvoicePdfError(exportError));
    } finally {
      setExporting(false);
      setExportAction(null);
    }
  }

  if (!invoiceReady) {
    return (
      <div className="mx-auto max-w-4xl rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <h1 className="text-lg font-semibold text-amber-950">Invoice not yet available</h1>
        <p className="mt-2">
          This order does not have enough data to generate a receipt yet. Please check back shortly
          or contact support if the issue persists.
        </p>
        <Link href="/account/orders" className="mt-4 inline-block text-orange-700 hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div id="order-receipt" className="relative mx-auto max-w-4xl">
      {exporting ? (
        <div
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px]"
          role="status"
          aria-live="polite"
          aria-label="Generating invoice PDF"
        >
          <div className="rounded-xl bg-white px-6 py-4 shadow-lg">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <Loader2 className="h-4 w-4 animate-spin text-orange-600" aria-hidden />
              Generating your invoice PDF...
            </p>
          </div>
        </div>
      ) : null}

      <div className="no-print mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handlePrintReceipt}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {exporting && exportAction === 'print' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Printer className="h-4 w-4" aria-hidden />
          )}
          {exporting && exportAction === 'print' ? 'Preparing...' : 'Print receipt'}
        </button>
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
        >
          {exporting && exportAction === 'download' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Download className="h-4 w-4" aria-hidden />
          )}
          {exporting && exportAction === 'download' ? 'Generating PDF...' : 'Download PDF'}
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
