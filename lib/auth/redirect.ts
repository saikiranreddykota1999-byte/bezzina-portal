/**
 * Sanitize post-login redirect paths to same-origin relative URLs only.
 */
export function sanitizeRedirectPath(
  path: string | null | undefined,
  fallback = '/account',
): string {
  if (!path) return fallback;

  const trimmed = path.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return fallback;
  if (trimmed.includes('://') || trimmed.includes('\\')) return fallback;
  if (trimmed.includes('@')) return fallback;

  return trimmed;
}
