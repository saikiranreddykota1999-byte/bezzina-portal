import { INVOICE_EXPORT_CSS } from '@/lib/invoice-export-styles';

const PDF_PAGE_WIDTH_PX = 794;

function absoluteAssetUrl(path: string): string {
  return new URL(path, window.location.origin).href;
}

export async function waitForImages(root: ParentNode): Promise<void> {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete && image.naturalWidth > 0) {
            resolve();
            return;
          }

          const finish = () => resolve();
          image.addEventListener('load', finish, { once: true });
          image.addEventListener('error', finish, { once: true });

          if (image.src) {
            const retry = image.src;
            image.src = '';
            image.src = retry;
          }
        }),
    ),
  );
}

function applyPickupCodeStyles(box: HTMLElement, pickupCode: string): void {
  const labelNode = box.querySelector('.inv-pickup-code-label');
  const valueNode = box.querySelector('.inv-pickup-code-value');

  if (labelNode instanceof HTMLElement) {
    labelNode.textContent = 'Pickup Code';
    labelNode.style.display = 'block';
    labelNode.style.color = '#c2410c';
    labelNode.style.fontSize = '10px';
    labelNode.style.fontWeight = '700';
    labelNode.style.letterSpacing = '0.08em';
    labelNode.style.textTransform = 'uppercase';
  }

  if (valueNode instanceof HTMLElement) {
    const code = pickupCode.trim() || '—';
    valueNode.textContent = code;
    valueNode.style.display = 'block';
    valueNode.style.color = '#0f172a';
    valueNode.style.fontSize = '18px';
    valueNode.style.fontWeight = '700';
    valueNode.style.letterSpacing = '0.06em';
    valueNode.style.lineHeight = '1.2';
  }
}

function prepareInvoiceClone(source: HTMLElement): HTMLElement {
  const clone = source.cloneNode(true) as HTMLElement;

  clone.querySelectorAll('img').forEach((image) => {
    const src = image.getAttribute('src');
    if (src) {
      image.src = absoluteAssetUrl(src);
      image.removeAttribute('crossorigin');
    }
  });

  const watermark = clone.querySelector('.receipt-watermark-img');
  if (watermark instanceof HTMLImageElement) {
    watermark.src = absoluteAssetUrl('/bezzina-watermark.png');
    watermark.style.opacity = '0.42';
    watermark.style.visibility = 'visible';
  }

  clone.querySelectorAll('.inv-doc-number').forEach((node) => {
    if (node instanceof HTMLElement) {
      node.style.color = '#ffffff';
      node.style.fontSize = '15px';
      node.style.fontWeight = '700';
      node.style.letterSpacing = '0.04em';
    }
  });

  clone.querySelectorAll('.inv-pickup-code').forEach((box) => {
    if (!(box instanceof HTMLElement)) return;
    const pickupCode = box.getAttribute('data-pickup-code') ?? '';
    applyPickupCodeStyles(box, pickupCode);
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
