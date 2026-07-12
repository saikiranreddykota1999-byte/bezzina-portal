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

  const sourceChildren = Array.from(source.children);
  const targetChildren = Array.from(target.children);

  sourceChildren.forEach((child, childIndex) => {
    const clonedChild = targetChildren[childIndex];
    if (clonedChild) {
      inlineComputedStyles(child, clonedChild);
    }
  });
}

export function syncClonedInvoiceColors(source: Element, clonedDocument: Document, target: Element): void {
  clonedDocument.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    node.remove();
  });

  inlineComputedStyles(source, target);
}
