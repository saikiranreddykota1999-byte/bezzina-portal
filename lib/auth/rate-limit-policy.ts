/**
 * Public form rate limiting must fail closed when the backing RPC errors.
 */
export function isPublicRateLimitAllowed(
  rpcError: { message?: string } | null | undefined,
  rpcData: boolean | null | undefined,
): boolean {
  if (rpcError) {
    return false;
  }
  return rpcData === true;
}
