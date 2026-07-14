const GENERIC_MESSAGES = {
  auth: 'Invalid email or password.',
  permission: 'You do not have permission for this action.',
  notFound: 'The requested resource was not found.',
  validation: 'Invalid input. Please check your entries and try again.',
  upload: 'File upload failed. Please check the file type and size.',
  rateLimit: 'Too many requests. Please try again later.',
  disabled: 'Your account has been disabled. Contact support.',
  default: 'Something went wrong. Please try again.',
} as const;

export type ErrorCategory = keyof typeof GENERIC_MESSAGES;

export function toUserError(
  error: unknown,
  category: ErrorCategory = 'default',
): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('permission') || msg.includes('access')) {
      return GENERIC_MESSAGES.permission;
    }
    if (msg.includes('disabled')) {
      return GENERIC_MESSAGES.disabled;
    }
    if (msg.includes('rate') || msg.includes('too many')) {
      return GENERIC_MESSAGES.rateLimit;
    }
  }
  return GENERIC_MESSAGES[category];
}

export function toAuthError(): string {
  return GENERIC_MESSAGES.auth;
}

export function logServerError(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${context}]`, message);
}
