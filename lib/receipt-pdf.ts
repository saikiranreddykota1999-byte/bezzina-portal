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

  return message || 'Unable to generate invoice PDF. Please try again.';
}

async function renderInvoiceCanvas(node: HTMLElement) {
  const html2canvas = (await import('html2canvas')).default;
  const width = node.scrollWidth || node.offsetWidth || 794;
  const height = node.scrollHeight;

  return html2canvas(node, {
    scale: 1.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    imageTimeout: 15000,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    scrollX: 0,
    scrollY: 0,
    foreignObjectRendering: false,
    onclone: (_document, clonedNode) => {
      if (clonedNode instanceof HTMLElement) {
        clonedNode.style.width = `${width}px`;
      }
    },
  });
}

async function buildInvoicePdf(node: HTMLElement, filename: string) {
  const { jsPDF } = await import('jspdf');
  const canvas = await renderInvoiceCanvas(node);
  const imageData = canvas.toDataURL('image/jpeg', 0.95);

  const pdf = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const printableWidth = pageWidth - margin * 2;
  const printableHeight = pageHeight - margin * 2;
  const imageHeight = (canvas.height * printableWidth) / canvas.width;

  let offsetY = 0;
  let page = 0;

  while (offsetY < imageHeight) {
    if (page > 0) {
      pdf.addPage();
    }

    pdf.addImage(imageData, 'JPEG', margin, margin - offsetY, printableWidth, imageHeight);
    offsetY += printableHeight;
    page += 1;
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

  const { mountInvoiceInIframe, unmountInvoiceIframe, waitForImages } = await import(
    '@/lib/invoice-pdf-colors'
  );

  const { iframe, node } = mountInvoiceInIframe(element);

  try {
    await waitForImages(node);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

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
  }
}
