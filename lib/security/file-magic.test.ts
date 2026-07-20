import { describe, expect, it } from 'vitest';
import { detectFileMimeFromBytes } from '@/lib/security/file-magic';

describe('detectFileMimeFromBytes', () => {
  it('detects jpeg', () => {
    expect(detectFileMimeFromBytes(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
  });

  it('detects png', () => {
    expect(
      detectFileMimeFromBytes(
        new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      ),
    ).toBe('image/png');
  });

  it('detects webp', () => {
    const bytes = new Uint8Array(12);
    bytes.set([0x52, 0x49, 0x46, 0x46], 0);
    bytes.set([0x57, 0x45, 0x42, 0x50], 8);
    expect(detectFileMimeFromBytes(bytes)).toBe('image/webp');
  });

  it('detects pdf', () => {
    expect(detectFileMimeFromBytes(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]))).toBe(
      'application/pdf',
    );
  });

  it('rejects unknown bytes', () => {
    expect(detectFileMimeFromBytes(new Uint8Array([0x00, 0x01, 0x02]))).toBeNull();
  });
});
