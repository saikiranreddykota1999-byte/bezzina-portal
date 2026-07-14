'use client';

import { useState } from 'react';
import { generateOmsReportAction } from '@/actions/oms-reports';
import { REPORT_TYPES, REPORT_PERIODS } from '@/config/oms';
import type { OmsReportSnapshot } from '@/types/oms';
import {
  adminButtonPrimaryClass,
  adminCardClass,
  adminSubtextClass,
} from '@/components/admin/admin-styles';

export function OmsReportsPanel() {
  const [report, setReport] = useState<OmsReportSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function runReport(
    reportType: (typeof REPORT_TYPES)[number],
    period: (typeof REPORT_PERIODS)[number],
  ) {
    setLoading(true);
    setError('');
    const result = await generateOmsReportAction({ reportType, period });
    if (result.success) setReport(result.data ?? null);
    else setError(result.error ?? 'Report failed');
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {REPORT_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            disabled={loading}
            className={adminButtonPrimaryClass}
            onClick={() => runReport(type, 'daily')}
          >
            {type} (daily)
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-[var(--admin-danger)]">{error}</p>}

      {report && (
        <section className={`${adminCardClass} p-5`}>
          <h2 className="text-lg font-semibold capitalize text-[var(--admin-navy)]">
            {report.report_type} — {report.period}
          </h2>
          <p className={adminSubtextClass}>
            {report.period_start} to {report.period_end}
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-50 p-4 text-xs text-slate-800">
            {JSON.stringify(report.metrics, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
