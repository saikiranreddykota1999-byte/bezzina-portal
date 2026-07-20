/**
 * Magic-byte sniffing for uploads — do not trust client MIME or extensions alone.
 */

export type DetectedFileKind =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/gif'
  | 'application/pdf'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | null;

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) return false;
  return signature.every((value, index) => bytes[index] === value);
}

function isWebp(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  const riff = startsWith(bytes, [0x52, 0x49, 0x46, 0x46]);
  const webp =
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  return riff && webp;
}

function isZipContainer(bytes: Uint8Array): boolean {
  return startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]) || startsWith(bytes, [0x50, 0x4b, 0x05, 0x06]);
}

/**
 * Detect content type from the first bytes of a file.
 * DOCX is ZIP-based — callers must still enforce the `.docx` extension.
 */
export function detectFileMimeFromBytes(bytes: Uint8Array): DetectedFileKind {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38])) return 'image/gif';
  if (isWebp(bytes)) return 'image/webp';
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46])) return 'application/pdf';
  if (startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) {
    return 'application/msword';
  }
  if (isZipContainer(bytes)) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  return null;
}

export async function readFileHead(file: Blob, maxBytes = 64): Promise<Uint8Array> {
  if (typeof file.arrayBuffer === 'function') {
    const full = await file.arrayBuffer();
    return new Uint8Array(full.slice(0, maxBytes));
  }

  // jsdom / incomplete Blob — Response can still materialize bytes.
  const full = await new Response(file).arrayBuffer();
  return new Uint8Array(full.slice(0, maxBytes));
}

