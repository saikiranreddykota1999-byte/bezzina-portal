type PdfAction = 'save' | 'open';

type ExportInvoicePdfOptions = {
  filename: string;
  action?: PdfAction;
};

export async function exportInvoicePdf({
  filename,
  action = 'save',
}: ExportInvoicePdfOptions): Promise<void> {
  const element = document.getElementById('invoice-document');
  if (!element) {
    throw new Error('Invoice document not found');
  }

  const { default: html2pdf } = await import('html2pdf.js');

  const worker = html2pdf()
    .set({
      margin: [10, 10, 10, 10],
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },
    })
    .from(element);

  if (action === 'open') {
    const blob = await worker.outputPdf('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }

  await worker.save();
}
