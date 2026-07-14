'use server';

import { requirePermission } from '@/lib/auth/server-session';
import { generateOmsReport } from '@/services/oms-report.service';
import { reportQuerySchema } from '@/lib/validators/oms';
import type { ActionResult } from '@/types/pickup';
import type { OmsReportSnapshot } from '@/types/oms';

export async function generateOmsReportAction(
  input: unknown,
): Promise<ActionResult<OmsReportSnapshot>> {
  try {
    const parsed = reportQuerySchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid report query' };
    }

    const { supabase } = await requirePermission('reports:view');
    const report = await generateOmsReport(
      supabase,
      parsed.data.reportType,
      parsed.data.period,
    );
    return { success: true, data: report };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate report',
    };
  }
}
