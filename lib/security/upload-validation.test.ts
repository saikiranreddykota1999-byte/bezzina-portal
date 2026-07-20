import { describe, expect, it, vi } from 'vitest';
import * as fileMagic from '@/lib/security/file-magic';
import { validateUploadFile } from '@/lib/security/upload-validation';

function makeFile(name: string, type: string, size = 128): File {
  const bytes = new Uint8Array(size);
  return new File([bytes], name, { type });
}

describe('validateUploadFile magic bytes', () => {
  it('accepts a sniffed jpeg for askBezzinaImage', async () => {
    vi.spyOn(fileMagic, 'readFileHead').mockResolvedValue(
      new Uint8Array([0xff, 0xd8, 0xff, 0xe0]),
    );
    const file = makeFile('part.jpg', 'image/jpeg');
    const result = await validateUploadFile(file, 'askBezzinaImage');
    expect(result).toEqual({ valid: true, contentType: 'image/jpeg' });
    vi.restoreAllMocks();
  });

  it('rejects mime spoofed jpeg when bytes are not jpeg', async () => {
    vi.spyOn(fileMagic, 'readFileHead').mockResolvedValue(new Uint8Array([0x00, 0x01, 0x02]));
    const file = makeFile('evil.jpg', 'image/jpeg');
    const result = await validateUploadFile(file, 'askBezzinaImage');
    expect(result.valid).toBe(false);
    vi.restoreAllMocks();
  });

  it('rejects gif for askBezzinaImage even when sniffed', async () => {
    vi.spyOn(fileMagic, 'readFileHead').mockResolvedValue(
      new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]),
    );
    const file = makeFile('anim.gif', 'image/gif');
    const result = await validateUploadFile(file, 'askBezzinaImage');
    expect(result.valid).toBe(false);
    vi.restoreAllMocks();
  });
});
