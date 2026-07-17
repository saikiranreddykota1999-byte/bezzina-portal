import type { ActionResult, ActionResultWithData } from '@/types/action';

export function actionOk(): ActionResult;
export function actionOk<T>(data: T): ActionResultWithData<T>;
export function actionOk<T>(data?: T): ActionResult<T> {
  if (arguments.length === 0) {
    return { success: true };
  }
  return { success: true, data: data as T };
}

export function actionFail(error: string): ActionResult<never> {
  return { success: false, error };
}

export function actionFromUnknown(
  error: unknown,
  fallback: string,
): ActionResult<never> {
  return {
    success: false,
    error: error instanceof Error ? error.message : fallback,
  };
}

/** Narrow a failed-or-empty result to a user-facing error message. */
export function actionErrorMessage(
  result: ActionResult<unknown>,
  fallback: string,
): string {
  if (!result.success) {
    return result.error;
  }
  return fallback;
}
