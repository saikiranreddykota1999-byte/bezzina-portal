import { describe, expect, it } from 'vitest';
import { focusRingClass } from '@/hooks/use-dialog-a11y';

describe('focusRingClass', () => {
  it('includes focus-visible ring utilities', () => {
    expect(focusRingClass).toContain('focus-visible:ring-2');
    expect(focusRingClass).toContain('focus-visible:ring-[#0B3D91]');
  });
});
