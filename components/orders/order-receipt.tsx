'use client';

import Link from 'next/link';
import { Download, Printer } from 'lucide-react';
import { TaxInvoiceDocument } from '@/components/orders/tax-invoice-document';
import type { OrderWithPickup } from '@/types/pickup';

function printReceipt() {
  window.print();
}

type Props = {
  order: OrderWithPickup;
};

export function OrderReceipt({ order }: Props) {
  return (
    <div id="order-receipt" className="mx-auto max-w-4xl">
      <div className="no-print mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={printReceipt}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Printer className="h-4 w-4" aria-hidden />
          Print receipt
        </button>
        <button
          type="button"
          onClick={printReceipt}
          title="In the print dialog, choose Save as PDF or Microsoft Print to PDF"
          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          <Download className="h-4 w-4" aria-hidden />
          Download PDF
        </button>
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
