/** Soft-delete payload for tables with deleted_at column. */

export function softDeletePayload() {
  return {
    deleted_at: new Date().toISOString(),
  } as const;
}

export function productSoftDeletePayload() {
  return {
    deleted_at: new Date().toISOString(),
    is_active: false,
  } as const;
}

export function categorySoftDeletePayload() {
  return {
    deleted_at: new Date().toISOString(),
  } as const;
}

export function vacancySoftDeletePayload() {
  return {
    deleted_at: new Date().toISOString(),
    is_active: false,
  } as const;
}
