import { INVOICE_EXPORT_CSS } from '@/lib/invoice-export-styles';

const PDF_PAGE_WIDTH_PX = 794;

export async function waitForImages(root: ParentNode): Promise<void> {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }
          image.addEventListener('load', () => resolve(), { once: true });
          image.addEventListener('error', () => resolve(), { once: true });
        }),
    ),
  );
}

function prepareInvoiceClone(source: HTMLElement): HTMLElement {
  const clone = source.cloneNode(true) as HTMLElement;
  const origin = window.location.origin;

  clone.querySelectorAll('img').forEach((image) => {
    const src = image.getAttribute('src');
    if (src) {
      image.src = new URL(src, origin).href;
    }
  });

  const watermark = clone.querySelector('.receipt-watermark-layer');
  if (watermark instanceof HTMLElement) {
    watermark.style.backgroundImage = `url('${origin}/bezzina-watermark.png')`;
  }

  clone.querySelectorAll('.inv-pickup-code-value, .inv-doc-number').forEach((node) => {
    if (node instanceof HTMLElement) {
      node.style.color = '#0f172a';
      node.style.fontWeight = '700';
      node.style.visibility = 'visible';
    }
  });

  return clone;
}

export function mountInvoiceInIframe(source: HTMLElement): {
  iframe: HTMLIFrameElement;
  node: HTMLElement;
} {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.left = '-10000px';
  iframe.style.top = '0';
  iframe.style.width = `${PDF_PAGE_WIDTH_PX}px`;
  iframe.style.height = '1200px';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    iframe.remove();
    throw new Error('Unable to create PDF frame');
  }

  doc.open();
  doc.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${INVOICE_EXPORT_CSS}</style></head><body></body></html>`,
  );
  doc.close();

  const node = prepareInvoiceClone(source);
  doc.body.style.margin = '0';
  doc.body.style.padding = '0';
  doc.body.style.width = `${PDF_PAGE_WIDTH_PX}px`;
  doc.body.appendChild(node);

  return { iframe, node };
}

export function unmountInvoiceIframe(iframe: HTMLIFrameElement): void {
  iframe.remove();
}

export { PDF_PAGE_WIDTH_PX };
