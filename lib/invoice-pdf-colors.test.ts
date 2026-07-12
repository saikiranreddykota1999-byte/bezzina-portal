import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { mapInvoicePdfError } from '@/lib/receipt-pdf';

describe('invoice PDF export', () => {
  it('renders inside an isolated iframe without suspending main page styles', () => {
    const colors = readFileSync(resolve(process.cwd(), 'lib/invoice-pdf-colors.ts'), 'utf8');
    const exportStyles = readFileSync(resolve(process.cwd(), 'lib/invoice-export-styles.ts'), 'utf8');
    const receiptPdf = readFileSync(resolve(process.cwd(), 'lib/receipt-pdf.ts'), 'utf8');

    expect(colors).toContain('prepareInvoiceClone');
    expect(colors).not.toContain('suspendMainDocumentStyles');
    expect(colors).toContain('INVOICE_EXPORT_CSS');
    expect(exportStyles).toContain('#invoice-document');
    expect(exportStyles).toContain('width: 794px');
    expect(exportStyles).toContain('.inv-doc-number');
    expect(receiptPdf).not.toContain('suspendMainDocumentStyles');
    expect(receiptPdf).toContain('mountInvoiceInIframe');
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
