type PdfAction = 'save' | 'open';

type ExportInvoicePdfOptions = {
  filename: string;
  action?: PdfAction;
};

export function mapInvoicePdfError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('Invoice document not found')) {
    return 'Invoice not yet available. Refresh the page and try again.';
  }

  if (message.includes('lab') || message.includes('oklch') || message.includes('color function')) {
    return 'PDF rendering failed due to a style conflict. Please refresh and try again.';
  }

  if (message.includes('Unable to create PDF frame')) {
    return 'Your browser blocked PDF generation. Try Print receipt instead.';
  }

  if (message.includes('insertBefore')) {
    return 'PDF rendering interrupted page styles. Refresh the page and try Download PDF again.';
  }

  return message || 'Unable to generate invoice PDF. Please try again.';
}

async function renderInvoiceCanvas(node: HTMLElement) {
  const html2canvas = (await import('html2canvas')).default;
  const ownerWindow = node.ownerDocument.defaultView ?? window;

  return html2canvas(node, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: node.scrollWidth,
    height: node.scrollHeight,
    windowWidth: ownerWindow.innerWidth,
    windowHeight: ownerWindow.innerHeight,
    scrollX: 0,
    scrollY: 0,
  });
}

async function buildInvoicePdf(node: HTMLElement, filename: string) {
  const { jsPDF } = await import('jspdf');
  const canvas = await renderInvoiceCanvas(node);
  const imageData = canvas.toDataURL('image/jpeg', 0.98);

  const pdf = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const printableWidth = pageWidth - margin * 2;
  const printableHeight = pageHeight - margin * 2;
  const imageHeight = (canvas.height * printableWidth) / canvas.width;

  let heightLeft = imageHeight;
  let position = margin;

  pdf.addImage(imageData, 'JPEG', margin, position, printableWidth, imageHeight);
  heightLeft -= printableHeight;

  while (heightLeft > 0) {
    position = margin - (imageHeight - heightLeft);
    pdf.addPage();
    pdf.addImage(imageData, 'JPEG', margin, position, printableWidth, imageHeight);
    heightLeft -= printableHeight;
  }

  return { pdf, filename };
}

export async function exportInvoicePdf({
  filename,
  action = 'save',
}: ExportInvoicePdfOptions): Promise<void> {
  const element = document.getElementById('invoice-document');
  if (!element) {
    throw new Error('Invoice document not found');
  }

  const {
    mountInvoiceInIframe,
    unmountInvoiceIframe,
    waitForImages,
    suspendMainDocumentStyles,
  } = await import('@/lib/invoice-pdf-colors');

  const restoreStyles = suspendMainDocumentStyles();
  const { iframe, node } = mountInvoiceInIframe(element);

  try {
    await waitForImages(node);
    const { pdf } = await buildInvoicePdf(node, filename);

    if (action === 'open') {
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      return;
    }

    pdf.save(filename);
  } finally {
    unmountInvoiceIframe(iframe);
    restoreStyles();
  }
}
