/**
 * Canonical result type for Server Actions and service boundaries.
 */
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export type ActionResultWithData<T> =
  | { success: true; data: T }
  | { success: false; error: string };
