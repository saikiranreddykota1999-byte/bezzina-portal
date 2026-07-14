'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  deleteVacancy,
  getAdminVacancies,
  upsertVacancy,
} from '@/actions/careers';
import type { Vacancy } from '@/types/quote';
import {
  adminBadgeNeutralClass,
  adminButtonPrimaryClass,
  adminButtonSecondaryClass,
  adminCardClass,
  adminHeadingClass,
  adminInputClass,
  adminLabelClass,
  adminLinkClass,
  adminSubtextClass,
  adminTextareaClass,
} from '@/components/admin/admin-styles';
import { ConfirmDestructiveDialog } from '@/components/admin/confirm-destructive-dialog';

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
        <p className={adminSubtextClass}>{vacancies.length} vacancies</p>
        <button
          type="button"
          onClick={() => setEditing(emptyVacancy)}
          className={adminButtonPrimaryClass}
        >
          Add Vacancy
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSave} className={`space-y-4 ${adminCardClass} p-6`}>
          <h2 className={adminHeadingClass}>{editing.id ? 'Edit' : 'New'} Vacancy</h2>
          <input
            placeholder="Title"
            value={editing.title ?? ''}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            className={adminInputClass}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              placeholder="Department"
              value={editing.department ?? ''}
              onChange={(e) => setEditing({ ...editing, department: e.target.value })}
              className={adminInputClass}
              required
            />
            <input
              placeholder="Location"
              value={editing.location ?? ''}
              onChange={(e) => setEditing({ ...editing, location: e.target.value })}
              className={adminInputClass}
              required
            />
          </div>
          <textarea
            placeholder="Short description (shown on careers page)"
            value={editing.short_description ?? ''}
            onChange={(e) => setEditing({ ...editing, short_description: e.target.value })}
            rows={2}
            className={adminTextareaClass}
            required
          />
          <textarea
            placeholder="Full description"
            value={editing.description ?? ''}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            rows={4}
            className={adminTextareaClass}
            required
          />
          <textarea
            placeholder="Requirements (optional)"
            value={editing.requirements ?? ''}
            onChange={(e) => setEditing({ ...editing, requirements: e.target.value })}
            rows={2}
            className={adminTextareaClass}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={`mb-1 block ${adminLabelClass}`}>Sort order</label>
              <input
                type="number"
                min="0"
                value={editing.sort_order ?? 0}
                onChange={(e) =>
                  setEditing({ ...editing, sort_order: Number(e.target.value) || 0 })
                }
                className={adminInputClass}
              />
            </div>
            <label className={`flex items-end gap-2 pb-2 text-sm ${adminSubtextClass}`}>
              <input
                type="checkbox"
                checked={editing.is_active ?? true}
                onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
              />
              Active (visible on careers page)
            </label>
          </div>
          {error && <p className="text-sm text-[var(--admin-danger)]">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={pending} className={adminButtonPrimaryClass}>
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setError('');
              }}
              className={adminButtonSecondaryClass}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && !editing && (
        <p className="rounded-lg border border-[var(--admin-danger-light)] bg-[var(--admin-danger-light)] px-4 py-3 text-sm text-[var(--admin-danger)]">
          {error}
        </p>
      )}

      <ul className="space-y-3">
        {vacancies.map((vacancy) => (
          <li
            key={vacancy.id}
            className={`flex items-center justify-between ${adminCardClass} p-4`}
          >
            <div>
              <p className="font-medium text-[var(--admin-navy)]">
                {vacancy.title}
                {!vacancy.is_active && (
                  <span className={`ml-2 ${adminBadgeNeutralClass}`}>Hidden</span>
                )}
              </p>
              <p className={`text-xs ${adminSubtextClass}`}>
                {vacancy.department} · {vacancy.location}
              </p>
              <p className={`mt-1 line-clamp-2 text-sm ${adminSubtextClass}`}>{vacancy.short_description}</p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => setEditing(vacancy)}
                className={adminLinkClass}
              >
                Edit
              </button>
              <ConfirmDestructiveDialog
                title="Delete vacancy?"
                description={`"${vacancy.title}" will be removed from the careers page.`}
                onConfirm={() => handleDelete(vacancy.id)}
              >
                {(open) => (
                  <button
                    type="button"
                    onClick={open}
                    className="text-sm text-[var(--admin-danger)] hover:underline"
                  >
                    Delete
                  </button>
                )}
              </ConfirmDestructiveDialog>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
