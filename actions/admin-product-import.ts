'use server';

import type { ActionResult } from '@/types/action';

import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth/server-session';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseCatalogueCsv } from '@/lib/catalogue/import-parser';
import {
  importCatalogueRows,
  importIndustrialToolsCatalogue,
  type ImportSummary,
} from '@/services/product-import.service';


export async function importIndustrialCatalogueAction(): Promise<ActionResult<ImportSummary>> {
  try {
    await requirePermission('products:manage');
    const supabase = createAdminClient();
    const summary = await importIndustrialToolsCatalogue(supabase);
    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: true, data: summary };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Industrial catalogue import failed',
    };
  }
}

export async function importCatalogueCsvAction(
  csvText: string,
): Promise<ActionResult<ImportSummary>> {
  try {
    await requirePermission('products:manage');
    const rows = parseCatalogueCsv(csvText);
    if (rows.length === 0) {
      return { success: false, error: 'No valid rows found in CSV file.' };
    }

    const supabase = createAdminClient();
    const summary = await importCatalogueRows(supabase, rows, { updateExisting: true });
    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: true, data: summary };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'CSV import failed',
    };
  }
}
