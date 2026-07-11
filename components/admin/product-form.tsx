'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  createProduct,
  updateProduct,
  uploadProductImage,
} from '@/actions/admin-products';
import type { Product } from '@/types/product';
import type { Category } from '@/types/product';

type Props = {
  categories: Category[];
  product?: Product;
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500';

export function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [name, setName] = useState(product?.name ?? '');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '');
  const [price, setPrice] = useState(product?.price?.toString() ?? '1.00');
  const [unit, setUnit] = useState(product?.unit ?? 'each');
  const [inStock, setInStock] = useState(product?.in_stock ?? true);
  const [stockQty, setStockQty] = useState(product?.stock_quantity?.toString() ?? '0');
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [uploading, setUploading] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!product) setSlug(slugify(value));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const payload = {
      sku,
      name,
      slug,
      description,
      category_id: categoryId,
      price: price ? Number(price) : 1.0,
      unit,
      in_stock: inStock,
      stock_quantity: Number(stockQty) || 0,
      is_active: isActive,
    };

    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (!product && result.data?.id) {
        router.push(`/admin/products/${result.data.id}`);
      } else {
        router.refresh();
      }
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!product || !e.target.files?.[0]) return;
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    const result = await uploadProductImage(product.id, formData);
    if (!result.success) setError(result.error);
    else router.refresh();
    setUploading(false);
  }

  return (
    <form onSubmit={handleSave} className="max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input value={name} onChange={(e) => handleNameChange(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">SKU</label>
          <input value={sku} onChange={(e) => setSku(e.target.value)} className={inputClass} required />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Slug</label>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} required />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass} required>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Price (€)</label>
          <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Unit</label>
          <input value={unit} onChange={(e) => setUnit(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Stock qty</label>
          <input type="number" min="0" value={stockQty} onChange={(e) => setStockQty(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
          In stock
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active (visible on site)
        </label>
      </div>

      {product && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Product image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="text-sm text-slate-700" />
          {uploading && <p className="mt-1 text-xs text-slate-600">Uploading…</p>}
        </div>
      )}

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {pending ? 'Saving…' : product ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  );
}
