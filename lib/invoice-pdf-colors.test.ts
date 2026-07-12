import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { mapInvoicePdfError } from '@/lib/receipt-pdf';

describe('invoice PDF export', () => {
  it('uses dedicated export stylesheet instead of stripping classes', () => {
    const colors = readFileSync(resolve(process.cwd(), 'lib/invoice-pdf-colors.ts'), 'utf8');
    const exportStyles = readFileSync(resolve(process.cwd(), 'lib/invoice-export-styles.ts'), 'utf8');
    const receiptPdf = readFileSync(resolve(process.cwd(), 'lib/receipt-pdf.ts'), 'utf8');

    expect(colors).toContain('prepareInvoiceClone');
    expect(colors).not.toContain('stripClasses');
    expect(colors).toContain('INVOICE_EXPORT_CSS');
    expect(exportStyles).toContain('#invoice-document');
    expect(exportStyles).toContain('width: 794px');
    expect(receiptPdf).toContain('suspendMainDocumentStyles()');
  });

  it('maps user-friendly invoice PDF errors', () => {
    expect(mapInvoicePdfError(new Error('Invoice document not found'))).toContain(
      'Invoice not yet available',
    );
    expect(mapInvoicePdfError(new Error('Attempting to parse an unsupported color function "lab"'))).toContain(
      'PDF rendering failed',
    );
  });
});
