'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAdminJobPostings,
  upsertJobPosting,
  deleteJobPosting,
} from '@/actions/careers';
import type { JobPosting } from '@/types/quote';

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900';

export function AdminCareersManager({ initialJobs }: { initialJobs: JobPosting[] }) {
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Partial<JobPosting> | null>(null);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError('');

    startTransition(async () => {
      const result = await upsertJobPosting(editing, editing.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      const refreshed = await getAdminJobPostings();
      if (refreshed.success && refreshed.data) setJobs(refreshed.data);
      setEditing(null);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this vacancy?')) return;
    startTransition(async () => {
      await deleteJobPosting(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{jobs.length} vacancies</p>
        <button
          type="button"
          onClick={() => setEditing({ title: '', department: '', location: 'Malta', description: '', is_active: true })}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Add Vacancy
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">{editing.id ? 'Edit' : 'New'} Vacancy</h2>
          <input placeholder="Title" value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inputClass} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <input placeholder="Department" value={editing.department ?? ''} onChange={(e) => setEditing({ ...editing, department: e.target.value })} className={inputClass} required />
            <input placeholder="Location" value={editing.location ?? ''} onChange={(e) => setEditing({ ...editing, location: e.target.value })} className={inputClass} required />
          </div>
          <textarea placeholder="Description" value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className={inputClass} required />
          <textarea placeholder="Requirements (optional)" value={editing.requirements ?? ''} onChange={(e) => setEditing({ ...editing, requirements: e.target.value })} rows={2} className={inputClass} />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
            Active (visible on careers page)
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={pending} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              Save
            </button>
            <button type="button" onClick={() => setEditing(null)} className="text-sm text-slate-600 hover:underline">
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-3">
        {jobs.map((job) => (
          <li key={job.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <p className="font-medium text-slate-900">{job.title}</p>
              <p className="text-xs text-slate-600">{job.department} · {job.location}</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditing(job)} className="text-sm text-orange-600 hover:underline">Edit</button>
              <button type="button" onClick={() => handleDelete(job.id)} className="text-sm text-red-600 hover:underline">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
