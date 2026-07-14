import { describe, expect, it } from 'vitest';
import { resolveCategoryVisual } from './category-visuals';

describe('resolveCategoryVisual', () => {
  it('maps hex bolts to a unique illustration', () => {
    const visual = resolveCategoryVisual('ind-bf-hex-bolts', 'Hex Bolts', 'industrial');
    expect(visual.illustrationId).toBe('hex-bolt');
    expect(visual.gradientFrom).toBe('#1E3A5F');
  });

  it('maps stainless bolts to marine stainless illustration', () => {
    const visual = resolveCategoryVisual('mar-nb-stainless-bolts', 'Stainless Bolts', 'marine');
    expect(visual.illustrationId).toBe('stainless-bolt');
    expect(visual.theme).toBe('marine');
  });

  it('maps carriage bolts separately from hex bolts', () => {
    const visual = resolveCategoryVisual('ind-bf-carriage-bolts', 'Carriage Bolts', 'industrial');
    expect(visual.illustrationId).toBe('carriage-bolt');
  });

  it('maps nuts and washers to distinct illustrations', () => {
    expect(resolveCategoryVisual('ind-bf-nuts', 'Nuts').illustrationId).toBe('nut');
    expect(resolveCategoryVisual('ind-bf-washers', 'Washers').illustrationId).toBe('washer');
    expect(resolveCategoryVisual('mar-nb-stainless-nuts', 'Stainless Nuts', 'marine').illustrationId).toBe(
      'stainless-nut',
    );
    expect(resolveCategoryVisual('mar-nb-stainless-washers', 'Stainless Washers', 'marine').illustrationId).toBe(
      'stainless-washer',
    );
  });

  it('maps fastener kits to toolbox illustration', () => {
    const visual = resolveCategoryVisual('mar-nb-fastener-kits', 'Fastener Kits', 'marine');
    expect(visual.illustrationId).toBe('fastener-kit');
  });

  it('maps anchor categories without matching bolt keywords first', () => {
    const visual = resolveCategoryVisual('marine-anchors', 'Anchors', 'marine');
    expect(visual.illustrationId).toBe('anchor');
  });
});
