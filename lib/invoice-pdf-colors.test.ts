import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('invoice PDF color sanitizer', () => {
  it('isolates invoice capture in an iframe without Tailwind stylesheets', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'lib/invoice-pdf-colors.ts'),
      'utf8',
    );
    const receiptPdf = readFileSync(resolve(process.cwd(), 'lib/receipt-pdf.ts'), 'utf8');

    expect(source).toContain('mountInvoiceInIframe');
    expect(source).toContain('createIsolatedInvoiceNode');
    expect(source).toContain('removeAttribute(\'class\')');
    expect(receiptPdf).toContain('mountInvoiceInIframe(element)');
    expect(receiptPdf).toContain("import('html2canvas')");
    expect(receiptPdf).not.toContain('html2pdf');
  });
});
