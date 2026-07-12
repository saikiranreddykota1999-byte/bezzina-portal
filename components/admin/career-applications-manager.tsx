'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { updateApplicationStatusAction } from '@/actions/admin-careers-applications';
import { AdminDataTable, type Column } from '@/components/admin/admin-data-table';

type ApplicationRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  cover_letter: string | null;
  cv_url: string;
  status: string;
  created_at: string;
  vacancy?: { title: string; department: string } | null;
};

type Props = { applications: ApplicationRow[] };

export function CareerApplicationsManager({ applications }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const columns: Column<ApplicationRow>[] = [
    { key: 'full_name', header: 'Applicant', sortable: true, render: (r) => r.full_name },
    { key: 'email', header: 'Email', render: (r) => r.email },
    {
      key: 'vacancy',
      header: 'Vacancy',
      render: (r) => r.vacancy?.title ?? '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <select
          value={r.status}
          disabled={pending}
          onChange={(e) => {
            startTransition(async () => {
              await updateApplicationStatusAction(
                r.id,
                e.target.value as 'received' | 'reviewing' | 'shortlisted' | 'interview' | 'rejected' | 'hired',
              );
              router.refresh();
            });
          }}
          className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
        >
          {['received', 'reviewing', 'shortlisted', 'interview', 'rejected', 'hired'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      ),
    },
    {
      key: 'cv_url',
      header: 'CV',
      render: (r) => (
        <a href={r.cv_url} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline">
          Download
        </a>
      ),
    },
    {
      key: 'cover_letter',
      header: 'Cover Letter',
      render: (r) => (r.cover_letter ? 'Yes' : '—'),
    },
    {
      key: 'linkedin_url',
      header: 'LinkedIn',
      render: (r) =>
        r.linkedin_url ? (
          <a href={r.linkedin_url} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline">
            View
          </a>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <AdminDataTable
      data={applications}
      columns={columns}
      searchKeys={['full_name', 'email', 'status']}
    />
  );
}
