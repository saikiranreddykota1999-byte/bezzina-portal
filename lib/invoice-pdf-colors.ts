const UNSUPPORTED_COLOR_PATTERN = /lab\(|oklch\(|color\(/i;

const SKIP_STYLE_PROPERTIES = new Set([
  'transition',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
  'transition-delay',
  'animation',
  'animation-name',
  'animation-duration',
]);

function normalizeColor(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'transparent' || trimmed === 'rgba(0, 0, 0, 0)') {
    return trimmed;
  }

  if (!UNSUPPORTED_COLOR_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    return trimmed;
  }

  try {
    context.fillStyle = '#000000';
    context.fillStyle = trimmed;
    return context.fillStyle;
  } catch {
    return trimmed;
  }
}

function sanitizeStyleValue(property: string, value: string): string {
  if (!value) return value;
  if (!UNSUPPORTED_COLOR_PATTERN.test(value)) return value;
  if (property === 'box-shadow') return 'none';
  return normalizeColor(value);
}

function inlineComputedStyles(source: Element, target: Element): void {
  if (!(source instanceof HTMLElement) || !(target instanceof HTMLElement)) {
    return;
  }

  const computed = window.getComputedStyle(source);

  for (let index = 0; index < computed.length; index += 1) {
    const property = computed.item(index);
    if (!property || SKIP_STYLE_PROPERTIES.has(property)) continue;

    const raw = computed.getPropertyValue(property);
    if (!raw) continue;

    const safeValue = sanitizeStyleValue(property, raw);
    if (safeValue) {
      target.style.setProperty(property, safeValue);
    }
  }

  if (target instanceof HTMLImageElement) {
    const src = target.getAttribute('src');
    if (src) {
      target.src = new URL(src, window.location.origin).href;
    }
  }

  const sourceChildren = Array.from(source.children);
  const targetChildren = Array.from(target.children);

  sourceChildren.forEach((child, childIndex) => {
    const clonedChild = targetChildren[childIndex];
    if (clonedChild) {
      inlineComputedStyles(child, clonedChild);
    }
  });
}

export function createIsolatedInvoiceNode(source: HTMLElement): HTMLElement {
  const clone = source.cloneNode(true) as HTMLElement;
  const watermark = clone.firstElementChild;

  function stripClasses(node: Element): void {
    if (node instanceof HTMLElement) {
      node.removeAttribute('class');
    }
    Array.from(node.children).forEach(stripClasses);
  }

  stripClasses(clone);
  inlineComputedStyles(source, clone);

  if (watermark instanceof HTMLElement) {
    watermark.style.backgroundImage = `url('${window.location.origin}/bezzina-watermark.png')`;
    watermark.style.backgroundRepeat = 'no-repeat';
    watermark.style.backgroundPosition = 'center center';
    watermark.style.backgroundSize = 'min(92%, 520px)';
    watermark.style.opacity = '0.5';
    watermark.style.position = 'absolute';
    watermark.style.inset = '0';
    watermark.style.pointerEvents = 'none';
    watermark.style.zIndex = '0';
  }

  return clone;
}

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

export const INVOICE_IFRAME_CSS = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #0f172a;
    font-family: Arial, Helvetica, sans-serif;
  }
`;

export function mountInvoiceInIframe(source: HTMLElement): {
  iframe: HTMLIFrameElement;
  node: HTMLElement;
} {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.left = '-10000px';
  iframe.style.top = '0';
  iframe.style.width = '794px';
  iframe.style.height = '1123px';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error('Unable to create PDF frame');
  }

  doc.open();
  doc.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${INVOICE_IFRAME_CSS}</style></head><body></body></html>`,
  );
  doc.close();

  const node = createIsolatedInvoiceNode(source);
  doc.body.appendChild(node);

  return { iframe, node };
}

export function unmountInvoiceIframe(iframe: HTMLIFrameElement): void {
  iframe.remove();
}
