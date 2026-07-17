'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from '@/actions/admin-categories';
import type { Category, CategoryDivision } from '@/types/product';
import {
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
import { slugify } from '@/lib/utils/slugify';

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

  function handleDelete(id: string) {
    setError('');
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (!result.success) setError(result.error);
    });
  }

  function renderDeleteButton(id: string, name: string) {
    return (
      <ConfirmDestructiveDialog
        title="Delete category?"
        description={`"${name}" will be soft-deleted and hidden from the catalogue.`}
        onConfirm={() => handleDelete(id)}
      >
        {(open) => (
          <button
            type="button"
            onClick={open}
            className="text-[var(--admin-danger)] hover:underline"
          >
            Delete
          </button>
        )}
      </ConfirmDestructiveDialog>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className={adminSubtextClass}>
          Manage marine and industrial categories and subcategories used in the product catalogue.
        </p>
        <button type="button" onClick={() => openCreate()} className={adminButtonPrimaryClass}>
          Add Category
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={`${adminCardClass} space-y-4 p-6`}>
          <h2 className={adminHeadingClass}>{editingId ? 'Edit Category' : 'New Category'}</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={`mb-1 block ${adminLabelClass}`}>Name</label>
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
                className={adminInputClass}
                required
              />
            </div>
            <div>
              <label className={`mb-1 block ${adminLabelClass}`}>Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                className={adminInputClass}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={`mb-1 block ${adminLabelClass}`}>Type</label>
              <select
                value={form.parent_id ? 'sub' : 'parent'}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    parent_id: e.target.value === 'sub' ? prev.parent_id || parents[0]?.id || '' : '',
                    division: e.target.value === 'sub' ? '' : prev.division || 'marine',
                  }))
                }
                className={adminInputClass}
              >
                <option value="parent">Top-level category</option>
                <option value="sub">Subcategory</option>
              </select>
            </div>

            {form.parent_id ? (
              <div>
                <label className={`mb-1 block ${adminLabelClass}`}>Parent</label>
                <select
                  value={form.parent_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, parent_id: e.target.value }))}
                  className={adminInputClass}
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
                <label className={`mb-1 block ${adminLabelClass}`}>Division</label>
                <select
                  value={form.division}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      division: e.target.value as CategoryDivision,
                    }))
                  }
                  className={adminInputClass}
                  required
                >
                  <option value="marine">Marine Supplies</option>
                  <option value="industrial">Industrial Equipment</option>
                </select>
              </div>
            )}

            <div>
              <label className={`mb-1 block ${adminLabelClass}`}>Sort order</label>
              <input
                type="number"
                min="0"
                value={form.sort_order}
                onChange={(e) => setForm((prev) => ({ ...prev, sort_order: e.target.value }))}
                className={adminInputClass}
              />
            </div>
          </div>

          <div>
            <label className={`mb-1 block ${adminLabelClass}`}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={adminTextareaClass}
            />
          </div>

          {error && <p className="text-sm text-[var(--admin-danger)]">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={pending} className={adminButtonPrimaryClass}>
              {pending ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setError('');
              }}
              className={adminButtonSecondaryClass}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && !showForm && (
        <p className="rounded-lg border border-[var(--admin-danger-light)] bg-[var(--admin-danger-light)] px-4 py-3 text-sm text-[var(--admin-danger)]">
          {error}
        </p>
      )}

      {grouped.map(({ division, parent, subs }) => (
        <section key={division} className={adminCardClass}>
          <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-5 py-4">
            <h2 className={`${adminHeadingClass} capitalize`}>{division}</h2>
            {parent && (
              <button type="button" onClick={() => openCreate(parent.id)} className={adminLinkClass}>
                Add subcategory
              </button>
            )}
          </div>

          <div className="divide-y divide-[var(--admin-border-light)]">
            {parent ? (
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-[var(--admin-navy)]">{parent.name}</p>
                  <p className={`text-xs ${adminSubtextClass}`}>{parent.slug}</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <button type="button" onClick={() => openEdit(parent)} className={adminLinkClass}>
                    Edit
                  </button>
                  {renderDeleteButton(parent.id, parent.name)}
                </div>
              </div>
            ) : (
              <p className={`px-5 py-4 text-sm ${adminSubtextClass}`}>No top-level category for {division} yet.</p>
            )}

            {subs.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between bg-[var(--admin-border-light)] px-5 py-3 pl-10">
                <div>
                  <p className="font-medium text-[var(--admin-navy)]">{sub.name}</p>
                  <p className={`text-xs ${adminSubtextClass}`}>{sub.slug}</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <button type="button" onClick={() => openEdit(sub)} className={adminLinkClass}>
                    Edit
                  </button>
                  {renderDeleteButton(sub.id, sub.name)}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
