import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProductCompare } from '@/hooks/use-product-compare';

describe('useProductCompare', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('caps compare list at 4 items', () => {
    const { result } = renderHook(() => useProductCompare());

    act(() => {
      for (let i = 0; i < 5; i += 1) {
        result.current.add({
          id: `id-${i}`,
          slug: `slug-${i}`,
          name: `Product ${i}`,
          sku: `SKU-${i}`,
          image_url: null,
        });
      }
    });

    expect(result.current.items).toHaveLength(4);
    expect(result.current.isFull).toBe(true);
    expect(result.current.has('id-4')).toBe(false);
  });
});
