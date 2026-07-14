'use client';

import { useState } from 'react';
import { Copy, ListPlus, Upload } from 'lucide-react';
import { parseVariantBulkText } from '@/lib/catalogue/import-parser';
import type { VariantDraft } from '@/components/admin/product-variants-section';
import { adminButtonSecondaryClass, adminTextareaClass } from '@/components/admin/admin-styles';

type Props = {
  productSku: string;
  variants: VariantDraft[];
  onChange: (variants: VariantDraft[]) => void;
};

export function ProductVariantBulkTools({ productSku, variants, onChange }: Props) {
  const [bulkText, setBulkText] = useState('');

  function handleBulkAdd() {
    const parsed = parseVariantBulkText(bulkText, productSku || 'SKU');
    if (parsed.length === 0) return;

    const next = [
      ...variants,
      ...parsed.map((item, index) => ({
        name: item.name,
        sku: item.sku,
        availability: 'available' as const,
        unit: 'each',
        weight_kg: null,
        specification: item.name,
        image_url: '',
        document_url: '',
        document_label: '',
        in_stock: true,
        stock_quantity: 0,
        price: null,
        sort_order: variants.length + index,
      })),
    ];
    onChange(next);
    setBulkText('');
  }

  function duplicateVariant(index: number) {
    const source = variants[index];
    if (!source) return;
    const copy: VariantDraft = {
      ...source,
      name: `${source.name} (Copy)`,
      sku: `${source.sku}-COPY`,
      sort_order: variants.length,
    };
    onChange([...variants, copy]);
  }

  function handleCsvFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const parsed = parseVariantBulkText(text, productSku || 'SKU');
      if (parsed.length === 0) return;
      onChange([
        ...variants,
        ...parsed.map((item, index) => ({
          name: item.name,
          sku: item.sku,
          availability: 'available' as const,
          unit: 'each',
          weight_kg: null,
          specification: item.name,
          image_url: '',
          document_url: '',
          document_label: '',
          in_stock: true,
          stock_quantity: 0,
          price: null,
          sort_order: variants.length + index,
        })),
      ]);
    };
    reader.readAsText(file);
  }

  return (
    <div className="mb-4 rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-border-light)] p-4">
      <p className="text-sm font-semibold text-[var(--admin-navy)]">Bulk Variant Tools</p>
      <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
        Paste one size per line, import CSV/Excel-exported text, duplicate variants, or bulk add.
      </p>

      <textarea
        value={bulkText}
        onChange={(event) => setBulkText(event.target.value)}
        rows={4}
        placeholder={'6 mm\n8 mm\n10 mm\n1/2"'}
        className={`mt-3 ${adminTextareaClass}`}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={handleBulkAdd} className={adminButtonSecondaryClass}>
          <ListPlus className="h-4 w-4" />
          Bulk Add Variants
        </button>
        <label className={`cursor-pointer ${adminButtonSecondaryClass}`}>
          <Upload className="h-4 w-4" />
          Import CSV Variants
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleCsvFile(file);
              event.currentTarget.value = '';
            }}
          />
        </label>
        {variants.length > 0 ? (
          <button
            type="button"
            onClick={() => duplicateVariant(variants.length - 1)}
            className={adminButtonSecondaryClass}
          >
            <Copy className="h-4 w-4" />
            Duplicate Last
          </button>
        ) : null}
      </div>
    </div>
  );
}
