'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { AdminCheckbox } from '@/components/admin/ui/admin-checkbox';
import {
  adminButtonDangerClass,
  adminButtonSecondaryClass,
  adminInputClass,
  adminTableClass,
  adminTableWrapClass,
} from '@/components/admin/admin-styles';

export type Column<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  render: (row: T) => React.ReactNode;
  className?: string;
};

export type BulkAction = {
  label: string;
  onAction: (ids: string[]) => void | Promise<void>;
  variant?: 'default' | 'danger';
};

type AdminDataTableProps<T extends { id: string }> = {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  pageSize?: number;
  bulkActions?: BulkAction[];
  emptyMessage?: string;
};

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

export function AdminDataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = 'Search…',
  searchKeys = [],
  pageSize = 10,
  bulkActions = [],
  emptyMessage = 'No records found.',
}: AdminDataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = data;

    if (q) {
      rows = rows.filter((row) =>
        searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(q)),
      );
    }

    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = (a as Record<string, unknown>)[sortKey];
        const bv = (b as Record<string, unknown>)[sortKey];
        const cmp = compareValues(av, bv);
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return rows;
  }, [data, query, searchKeys, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const allSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir('asc');
  }

  function toggleAll(checked: boolean) {
    if (!checked) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(pageRows.map((r) => r.id)));
  }

  function toggleRow(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const selectedIds = Array.from(selected);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className={`${adminInputClass} !py-2.5 !pl-10`}
          />
        </div>

        {bulkActions.length > 0 && selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {bulkActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => void action.onAction(selectedIds)}
                className={action.variant === 'danger' ? adminButtonDangerClass : adminButtonSecondaryClass}
              >
                {action.label} ({selectedIds.length})
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={adminTableWrapClass}>
        <table className={adminTableClass}>
          <thead>
            <tr>
              {bulkActions.length > 0 && (
                <th scope="col" className="!w-12">
                  <AdminCheckbox
                    id="select-all-rows"
                    checked={allSelected}
                    onChange={toggleAll}
                    ariaLabel="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} scope="col" className={col.className ?? ''}>
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 font-semibold text-white"
                    >
                      {col.header}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      ) : null}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (bulkActions.length > 0 ? 1 : 0)}
                  className="admin-table-empty"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={row.id}>
                  {bulkActions.length > 0 && (
                    <td>
                      <AdminCheckbox
                        id={`select-row-${row.id}`}
                        checked={selected.has(row.id)}
                        onChange={(checked) => toggleRow(row.id, checked)}
                        ariaLabel="Select row"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={col.className ?? ''}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[var(--admin-text-muted)]">
          <p>
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of{' '}
            {filtered.length}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => p - 1)}
              className={`${adminButtonSecondaryClass} !min-h-0 !py-1.5 !text-sm disabled:opacity-40`}
            >
              Previous
            </button>
            <span className="flex items-center px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={`${adminButtonSecondaryClass} !min-h-0 !py-1.5 !text-sm disabled:opacity-40`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function exportToCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: keyof T; header: string }[],
  filename: string,
) {
  const header = columns.map((c) => c.header).join(',');
  const body = rows
    .map((row) =>
      columns
        .map((c) => `"${String(row[c.key] ?? '').replace(/"/g, '""')}"`)
        .join(','),
    )
    .join('\n');
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
