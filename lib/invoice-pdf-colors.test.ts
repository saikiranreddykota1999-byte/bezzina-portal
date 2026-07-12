import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('invoice PDF color sanitizer', () => {
  it('strips stylesheets and inlines computed styles in clone handler', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'lib/invoice-pdf-colors.ts'),
      'utf8',
    );

    expect(source).toContain("clonedDocument.querySelectorAll('link[rel=\"stylesheet\"], style')");
    expect(source).toContain('inlineComputedStyles(source, target)');
    expect(source).toContain('normalizeColor');
  });
});
