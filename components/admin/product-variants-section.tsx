'use client';

import { Plus, Trash2 } from 'lucide-react';
import { INVENTORY_STATUS_OPTIONS, type ProductVariant } from '@/types/product';

type VariantDraft = Omit<ProductVariant, 'id' | 'product_id'> & { id?: string };

type Props = {
  variants: VariantDraft[];
  onChange: (variants: VariantDraft[]) => void;
};

const emptyVariant = (): VariantDraft => ({
  name: '',
  sku: '',
  availability: 'available',
  unit: 'each',
  weight_kg: null,
  specification: '',
  image_url: '',
  document_url: '',
  document_label: '',
  in_stock: true,
  stock_quantity: 0,
  price: null,
  sort_order: 0,
});

export function ProductVariantsSection({ variants, onChange }: Props) {
  function addVariant() {
    onChange([...variants, emptyVariant()]);
  }

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function removeVariant(index: number) {
    onChange(variants.filter((_, i) => i !== index));
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Product Variants</h3>
        <button
          type="button"
          onClick={addVariant}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <Plus className="h-3.5 w-3.5" /> Add Variant
        </button>
      </div>
      <div className="space-y-4">
        {variants.map((variant, index) => (
          <div key={index} className="rounded-lg border border-slate-100 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-800">Variant {index + 1}</p>
              <button type="button" onClick={() => removeVariant(index)} className="text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <input
                value={variant.name}
                onChange={(e) => updateVariant(index, { name: e.target.value })}
                placeholder="Name (e.g. 6mm)"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                value={variant.sku}
                onChange={(e) => updateVariant(index, { sku: e.target.value })}
                placeholder="SKU"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <select
                value={variant.availability}
                onChange={(e) => updateVariant(index, { availability: e.target.value as ProductVariant['availability'] })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {INVENTORY_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <input
                value={variant.unit}
                onChange={(e) => updateVariant(index, { unit: e.target.value })}
                placeholder="Unit"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                step="0.001"
                value={variant.weight_kg ?? ''}
                onChange={(e) => updateVariant(index, { weight_kg: e.target.value ? Number(e.target.value) : null })}
                placeholder="Weight (kg)"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={variant.stock_quantity}
                onChange={(e) => updateVariant(index, { stock_quantity: Number(e.target.value) })}
                placeholder="Stock qty"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <textarea
                value={variant.specification ?? ''}
                onChange={(e) => updateVariant(index, { specification: e.target.value })}
                placeholder="Specification"
                rows={2}
                className="sm:col-span-2 lg:col-span-3 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                value={variant.image_url ?? ''}
                onChange={(e) => updateVariant(index, { image_url: e.target.value })}
                placeholder="Image URL"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                value={variant.document_url ?? ''}
                onChange={(e) => updateVariant(index, { document_url: e.target.value })}
                placeholder="Document URL"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        ))}
        {variants.length === 0 && <p className="text-sm text-slate-500">No variants. Add sizes, grades, or configurations.</p>}
      </div>
    </section>
  );
}
