import { z } from 'zod';
import { SECURITY_CONFIG } from '@/config/security';

export const uuidSchema = z.string().uuid();

export const bulkIdsSchema = z
  .array(uuidSchema)
  .min(1, 'Select at least one item')
  .max(SECURITY_CONFIG.bulkOperationMaxIds, `Maximum ${SECURITY_CONFIG.bulkOperationMaxIds} items per request`);

export function parseBulkIds(ids: string[]) {
  return bulkIdsSchema.safeParse(ids);
}

export const productIdSchema = uuidSchema;
