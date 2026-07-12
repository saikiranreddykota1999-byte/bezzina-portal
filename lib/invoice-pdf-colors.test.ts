import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { mapInvoicePdfError } from '@/lib/receipt-pdf';

describe('invoice PDF export', () => {
  it('isolates invoice capture and suspends main document styles', () => {
    const colors = readFileSync(resolve(process.cwd(), 'lib/invoice-pdf-colors.ts'), 'utf8');
    const receiptPdf = readFileSync(resolve(process.cwd(), 'lib/receipt-pdf.ts'), 'utf8');

    expect(colors).toContain("node.textContent = '/* pdf-export-suspended */'");
    expect(colors).not.toContain('node.remove()');
    expect(colors).toContain('mountInvoiceInIframe');
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
