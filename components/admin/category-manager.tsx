'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from '@/actions/admin-categories';
import type { Category, CategoryDivision } from '@/types/product';

type Props = {
  parents: Category[];
  subcategories: Category[];
};

type FormState = {
  name: string;
  slug: string;
  description: string;
  division: CategoryDivision | '';
  parent_id: string;
  sort_order: string;
};

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function emptyForm(parentId = ''): FormState {
  return {
    name: '',
    slug: '',
    description: '',
    division: '',
    parent_id: parentId,
    sort_order: '0',
  };
}

export function CategoryManager({ parents, subcategories }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [showForm, setShowForm] = useState(false);

  const grouped = useMemo(() => {
    const divisions: CategoryDivision[] = ['marine', 'industrial'];
    return divisions.map((division) => ({
      division,
      parent: parents.find((p) => p.division === division && !p.parent_id),
      subs: subcategories.filter((s) => {
        const parent = parents.find((p) => p.id === s.parent_id);
        return parent?.division === division;
      }),
    }));
  }, [parents, subcategories]);

  function openCreate(parentId = '') {
    setEditingId(null);
    setForm(emptyForm(parentId));
    setShowForm(true);
    setError('');
  }

  function openEdit(category: Category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      division: category.division ?? '',
      parent_id: category.parent_id ?? '',
      sort_order: String(category.sort_order ?? 0),
    });
    setShowForm(true);
    setError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      division: form.parent_id ? null : (form.division || null),
      parent_id: form.parent_id || null,
      sort_order: Number(form.sort_order) || 0,
    };

    startTransition(async () => {
      const result = editingId
        ? await updateCategory(editingId, payload)
        : await createCategory(payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
    });
  }

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setError('');
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (!result.success) setError(result.error);
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          Manage marine and industrial categories and subcategories used in the product catalogue.
        </p>
        <button
          type="button"
          onClick={() => openCreate()}
          className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Add Category
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            {editingId ? 'Edit Category' : 'New Category'}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
              <input
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    name,
                    slug: editingId ? prev.slug : slugify(name),
                  }));
                }}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
              <select
                value={form.parent_id ? 'sub' : 'parent'}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    parent_id: e.target.value === 'sub' ? prev.parent_id || parents[0]?.id || '' : '',
                    division: e.target.value === 'sub' ? '' : prev.division || 'marine',
                  }))
                }
                className={inputClass}
              >
                <option value="parent">Top-level category</option>
                <option value="sub">Subcategory</option>
              </select>
            </div>

            {form.parent_id ? (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Parent</label>
                <select
                  value={form.parent_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, parent_id: e.target.value }))}
                  className={inputClass}
                  required
                >
                  <option value="">Select parent</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Division</label>
                <select
                  value={form.division}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      division: e.target.value as CategoryDivision,
                    }))
                  }
                  className={inputClass}
                  required
                >
                  <option value="marine">Marine Supplies</option>
                  <option value="industrial">Industrial Equipment</option>
                </select>
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Sort order</label>
              <input
                type="number"
                min="0"
                value={form.sort_order}
                onChange={(e) => setForm((prev) => ({ ...prev, sort_order: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {pending ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setError('');
              }}
              className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && !showForm && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {grouped.map(({ division, parent, subs }) => (
        <section key={division} className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold capitalize text-slate-900">{division}</h2>
            {parent && (
              <button
                type="button"
                onClick={() => openCreate(parent.id)}
                className="text-sm font-medium text-orange-600 hover:underline"
              >
                Add subcategory
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {parent ? (
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-slate-900">{parent.name}</p>
                  <p className="text-xs text-slate-500">{parent.slug}</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <button type="button" onClick={() => openEdit(parent)} className="text-orange-600 hover:underline">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(parent.id, parent.name)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <p className="px-5 py-4 text-sm text-slate-500">No top-level category for {division} yet.</p>
            )}

            {subs.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between bg-slate-50 px-5 py-3 pl-10">
                <div>
                  <p className="font-medium text-slate-800">{sub.name}</p>
                  <p className="text-xs text-slate-500">{sub.slug}</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <button type="button" onClick={() => openEdit(sub)} className="text-orange-600 hover:underline">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(sub.id, sub.name)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
