'use client';

import { useRef, useState } from 'react';
import { Download, FileSpreadsheet, Loader2, Upload } from 'lucide-react';
import {
  importCatalogueCsvAction,
  importIndustrialCatalogueAction,
} from '@/actions/admin-product-import';
import { IMPORT_CSV_TEMPLATE } from '@/lib/catalogue/import-parser';
import { adminButtonPrimaryClass, adminButtonSecondaryClass, adminCardClass } from '@/components/admin/admin-styles';

export function ProductImportPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<'csv' | 'catalogue' | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleCsvImport(file: File) {
    setLoading('csv');
    setError('');
    setMessage('');

    try {
      const text = await file.text();
      const result = await importCatalogueCsvAction(text);
      if (!result.success) {
        setError(result.error);
        return;
      }

      const summary = result.data;
      setMessage(
        `Imported ${summary.productsCreated} products, updated ${summary.productsUpdated}, ` +
          `${summary.variantsCreated} variants created, ${summary.variantsUpdated} variants updated. ` +
          `${summary.skipped} skipped.`,
      );
      if (summary.errors.length > 0) {
        setError(summary.errors.slice(0, 3).join(' | '));
      }
    } finally {
      setLoading(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleCatalogueSeed() {
    setLoading('catalogue');
    setError('');
    setMessage('');

    try {
      const result = await importIndustrialCatalogueAction();
      if (!result.success) {
        setError(result.error);
        return;
      }

      const summary = result.data;
      setMessage(
        `Catalogue seeded: ${summary.productsCreated} products created, ${summary.productsUpdated} updated, ` +
          `${summary.variantsCreated} variants.`,
      );
      if (summary.errors.length > 0) {
        setError(summary.errors.slice(0, 3).join(' | '));
      }
    } finally {
      setLoading(null);
    }
  }

  function downloadTemplate() {
    const blob = new Blob([IMPORT_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'product-import-template.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className={`${adminCardClass} mb-6 p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--admin-navy)]">Bulk Import</h2>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
            Import products and variants from CSV or seed the full industrial tools catalogue. Excel
            files can be saved as CSV before upload.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={downloadTemplate} className={adminButtonSecondaryClass}>
            <Download className="h-4 w-4" />
            CSV Template
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading !== null}
            className={adminButtonSecondaryClass}
          >
            {loading === 'csv' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Import CSV
          </button>
          <button
            type="button"
            onClick={handleCatalogueSeed}
            disabled={loading !== null}
            className={adminButtonPrimaryClass}
          >
            {loading === 'catalogue' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Seed Industrial Catalogue
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleCsvImport(file);
        }}
      />

      {message ? <p className="mt-4 text-sm text-[var(--admin-success)]">{message}</p> : null}
      {error ? (
        <p className="mt-2 text-sm text-[var(--admin-danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
