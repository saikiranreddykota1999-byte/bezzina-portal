type UploadRule = {
  allowedMimeTypes: readonly string[];
  allowedExtensions: readonly string[];
  maxBytes: number;
};

const IMAGE_RULE: UploadRule = {
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  maxBytes: 5 * 1024 * 1024,
};

const DOCUMENT_RULE: UploadRule = {
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  allowedExtensions: ['.pdf', '.doc', '.docx'],
  maxBytes: 20 * 1024 * 1024,
};

const CV_RULE: UploadRule = {
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  allowedExtensions: ['.pdf', '.doc', '.docx'],
  maxBytes: 5 * 1024 * 1024,
};

const MEDIA_RULE: UploadRule = {
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'],
  maxBytes: 15 * 1024 * 1024,
};

export const UPLOAD_RULES = {
  image: IMAGE_RULE,
  document: DOCUMENT_RULE,
  cv: CV_RULE,
  media: MEDIA_RULE,
} as const;

export type UploadKind = keyof typeof UPLOAD_RULES;

function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  if (dot < 0) return '';
  return fileName.slice(dot).toLowerCase();
}

function hasDoubleExtension(fileName: string): boolean {
  const parts = fileName.split('.');
  return parts.length > 2;
}

export function validateUploadFile(
  file: File,
  kind: UploadKind,
): { valid: true; contentType: string } | { valid: false; error: string } {
  const rule = UPLOAD_RULES[kind];

  if (!file || file.size === 0) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > rule.maxBytes) {
    return {
      valid: false,
      error: `File must be under ${Math.round(rule.maxBytes / (1024 * 1024))} MB`,
    };
  }

  if (hasDoubleExtension(file.name)) {
    return { valid: false, error: 'Invalid file name' };
  }

  const ext = getExtension(file.name);
  if (!rule.allowedExtensions.includes(ext)) {
    return { valid: false, error: 'File type not allowed' };
  }

  if (!rule.allowedMimeTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }

  return { valid: true, contentType: file.type };
}

export function sanitizeUploadFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.{2,}/g, '.');
}

export function sanitizeFolderName(folder: string): string {
  const cleaned = folder.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return cleaned.slice(0, 32) || 'general';
}
