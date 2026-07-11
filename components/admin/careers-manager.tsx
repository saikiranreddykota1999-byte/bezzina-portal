'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  deleteVacancy,
  getAdminVacancies,
  upsertVacancy,
} from '@/actions/careers';
import type { Vacancy } from '@/types/quote';

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900';

const emptyVacancy: Partial<Vacancy> = {
  title: '',
  department: '',
  location: 'Malta',
  short_description: '',
  description: '',
  requirements: '',
  is_active: true,
  sort_order: 0,
};

export function AdminCareersManager({ initialVacancies }: { initialVacancies: Vacancy[] }) {
  const router = useRouter();
  const [vacancies, setVacancies] = useState(initialVacancies);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Partial<Vacancy> | null>(null);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError('');

    startTransition(async () => {
      const result = await upsertVacancy(editing, editing.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      const refreshed = await getAdminVacancies();
      if (refreshed.success && refreshed.data) setVacancies(refreshed.data);
      setEditing(null);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this vacancy?')) return;
    startTransition(async () => {
      const result = await deleteVacancy(id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setVacancies((prev) => prev.filter((v) => v.id !== id));
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{vacancies.length} vacancies</p>
        <button
          type="button"
          onClick={() => setEditing(emptyVacancy)}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Add Vacancy
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">{editing.id ? 'Edit' : 'New'} Vacancy</h2>
          <input
            placeholder="Title"
            value={editing.title ?? ''}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            className={inputClass}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              placeholder="Department"
              value={editing.department ?? ''}
              onChange={(e) => setEditing({ ...editing, department: e.target.value })}
              className={inputClass}
              required
            />
            <input
              placeholder="Location"
              value={editing.location ?? ''}
              onChange={(e) => setEditing({ ...editing, location: e.target.value })}
              className={inputClass}
              required
            />
          </div>
          <textarea
            placeholder="Short description (shown on careers page)"
            value={editing.short_description ?? ''}
            onChange={(e) => setEditing({ ...editing, short_description: e.target.value })}
            rows={2}
            className={inputClass}
            required
          />
          <textarea
            placeholder="Full description"
            value={editing.description ?? ''}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            rows={4}
            className={inputClass}
            required
          />
          <textarea
            placeholder="Requirements (optional)"
            value={editing.requirements ?? ''}
            onChange={(e) => setEditing({ ...editing, requirements: e.target.value })}
            rows={2}
            className={inputClass}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Sort order</label>
              <input
                type="number"
                min="0"
                value={editing.sort_order ?? 0}
                onChange={(e) =>
                  setEditing({ ...editing, sort_order: Number(e.target.value) || 0 })
                }
                className={inputClass}
              />
            </div>
            <label className="flex items-end gap-2 pb-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={editing.is_active ?? true}
                onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
              />
              Active (visible on careers page)
            </label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setError('');
              }}
              className="text-sm text-slate-600 hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && !editing && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <ul className="space-y-3">
        {vacancies.map((vacancy) => (
          <li
            key={vacancy.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
          >
            <div>
              <p className="font-medium text-slate-900">
                {vacancy.title}
                {!vacancy.is_active && (
                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    Hidden
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-600">
                {vacancy.department} · {vacancy.location}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{vacancy.short_description}</p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => setEditing(vacancy)}
                className="text-sm text-orange-600 hover:underline"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(vacancy.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
