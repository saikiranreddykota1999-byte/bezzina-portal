'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { TechnicalSpecRow } from '@/types/product';
import {
  adminButtonSecondaryClass,
  adminCardClass,
  adminHeadingClass,
  adminInputClass,
  adminSubtextClass,
} from '@/components/admin/admin-styles';

type Props = {
  specs: TechnicalSpecRow[];
  onChange: (specs: TechnicalSpecRow[]) => void;
};

export function ProductSpecsBuilder({ specs, onChange }: Props) {
  function addRow() {
    onChange([...specs, { property: '', value: '' }]);
  }

  function updateRow(index: number, field: keyof TechnicalSpecRow, value: string) {
    onChange(specs.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function removeRow(index: number) {
    onChange(specs.filter((_, i) => i !== index));
  }

  return (
    <section className={`${adminCardClass} p-5`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className={`text-sm ${adminHeadingClass}`}>Specifications</h3>
        <button
          type="button"
          onClick={addRow}
          className={`inline-flex items-center gap-1 text-xs ${adminButtonSecondaryClass}`}
        >
          <Plus className="h-3.5 w-3.5" /> Add Specification
        </button>
      </div>
      <div className="space-y-2">
        {specs.map((row, index) => (
          <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input
              value={row.property}
              onChange={(e) => updateRow(index, 'property', e.target.value)}
              placeholder="Property (e.g. Material)"
              className={adminInputClass}
            />
            <input
              value={row.value}
              onChange={(e) => updateRow(index, 'value', e.target.value)}
              placeholder="Value (e.g. Stainless Steel)"
              className={adminInputClass}
            />
            <button type="button" onClick={() => removeRow(index)} className="text-[var(--admin-danger)] hover:text-[var(--admin-danger)]">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {specs.length === 0 && <p className={`text-sm ${adminSubtextClass}`}>No specifications added yet.</p>}
      </div>
    </section>
  );
}
