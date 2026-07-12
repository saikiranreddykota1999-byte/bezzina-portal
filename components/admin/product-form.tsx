'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  createProduct,
  updateProduct,
  uploadProductImage,
  saveProductVariants,
} from '@/actions/admin-products';
import { ProductImagesSection } from '@/components/admin/product-images-section';
import { ProductDocumentsSection } from '@/components/admin/product-documents-section';
import { ProductSpecsBuilder } from '@/components/admin/product-specs-builder';
import { ProductVariantsSection } from '@/components/admin/product-variants-section';
import { ProductFeatureToggles } from '@/components/admin/product-feature-toggles';
import type { Product, TechnicalSpecRow, InventoryStatus } from '@/types/product';
import { INVENTORY_STATUS_OPTIONS, PRODUCT_FEATURE_FLAGS } from '@/types/product';
import type { CategoryTree } from '@/actions/admin-categories';

type Props = {
  categoryTree: CategoryTree;
  product?: Product;
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parseSpecs(product?: Product): TechnicalSpecRow[] {
  if (!product?.technical_specs) return [];
  if (Array.isArray(product.technical_specs)) return product.technical_specs;
  return Object.entries(product.technical_specs).map(([property, value]) => ({ property, value }));
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500';

export function ProductForm({ categoryTree, product }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [name, setName] = useState(product?.name ?? '');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [parentCategoryId, setParentCategoryId] = useState(() => {
    if (!product?.category_id) return '';
    const sub = categoryTree.subcategories.find((c) => c.id === product.category_id);
    return sub?.parent_id ?? '';
  });
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '');
  const [price, setPrice] = useState(product?.price?.toString() ?? '1.00');
  const [unit, setUnit] = useState(product?.unit ?? 'each');
  const [inStock, setInStock] = useState(product?.in_stock ?? true);
  const [stockQty, setStockQty] = useState(product?.stock_quantity?.toString() ?? '0');
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [publishStatus, setPublishStatus] = useState<'draft' | 'published'>(
    product?.publish_status ?? 'published',
  );
  const [availability, setAvailability] = useState<InventoryStatus>(
    (product?.availability as InventoryStatus) ?? 'available',
  );
  const [longDescription, setLongDescription] = useState(product?.long_description ?? '');
  const [seoTitle, setSeoTitle] = useState(product?.seo_title ?? '');
  const [seoDescription, setSeoDescription] = useState(product?.seo_description ?? '');
  const [searchKeywords, setSearchKeywords] = useState(product?.search_keywords ?? '');
  const [internalNotes, setInternalNotes] = useState(product?.internal_notes ?? '');
  const [videoUrl, setVideoUrl] = useState(product?.video_url ?? '');
  const [youtubeUrl, setYoutubeUrl] = useState(product?.youtube_url ?? '');
  const [weightKg, setWeightKg] = useState(product?.weight_kg?.toString() ?? '');
  const [specs, setSpecs] = useState<TechnicalSpecRow[]>(parseSpecs(product));
  const [variants, setVariants] = useState(
    (product?.variants ?? []).map(({ id: _id, product_id: _pid, ...rest }) => rest),
  );
  const [featureFlags, setFeatureFlags] = useState(
    Object.fromEntries(
      PRODUCT_FEATURE_FLAGS.map(({ key }) => [key, Boolean(product?.[key as keyof Product])]),
    ) as Record<(typeof PRODUCT_FEATURE_FLAGS)[number]['key'], boolean>,
  );
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const subcategoriesForParent = useMemo(() => {
    if (!parentCategoryId) return categoryTree.subcategories;
    return categoryTree.subcategories.filter((c) => c.parent_id === parentCategoryId);
  }, [categoryTree.subcategories, parentCategoryId]);

  function handleNameChange(value: string) {
    setName(value);
    if (!product) setSlug(slugify(value));
  }

  function handleParentChange(value: string) {
    setParentCategoryId(value);
    setCategoryId('');
  }

  async function uploadSelectedImage(productId: string) {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append('file', imageFile);
    const result = await uploadProductImage(productId, formData);
    if (!result.success) throw new Error(result.error);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const payload = {
      sku,
      name,
      slug,
      description,
      long_description: longDescription,
      category_id: categoryId,
      price: price ? Number(price) : 1.0,
      unit,
      in_stock: inStock,
      stock_quantity: Number(stockQty) || 0,
      is_active: isActive,
      publish_status: publishStatus,
      availability,
      weight_kg: weightKg ? Number(weightKg) : null,
      video_url: videoUrl,
      youtube_url: youtubeUrl,
      technical_specs: specs.filter((s) => s.property && s.value),
      seo_title: seoTitle,
      seo_description: seoDescription,
      search_keywords: searchKeywords,
      internal_notes: internalNotes,
      ...featureFlags,
    };

    startTransition(async () => {
      try {
        const result = product
          ? await updateProduct(product.id, payload)
          : await createProduct(payload);

        if (!result.success) {
          setError(result.error);
          return;
        }

        const productId = product?.id ?? result.data?.id;
        if (productId) {
          if (imageFile) {
            setUploading(true);
            await uploadSelectedImage(productId);
            setUploading(false);
          }
          await saveProductVariants(productId, variants);
        }

        if (!product && result.data?.id) {
          router.push(`/admin/products/${result.data.id}`);
        } else {
          router.refresh();
        }
      } catch (uploadError) {
        setUploading(false);
        setError(uploadError instanceof Error ? uploadError.message : 'Save failed');
      }
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (product) {
      setUploading(true);
      setError('');
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadProductImage(product.id, formData);
      if (!result.success) setError(result.error);
      else router.refresh();
      setUploading(false);
      return;
    }

    setImageFile(file);
  }

  return (
    <form onSubmit={handleSave} className="max-w-4xl space-y-6">
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
          <select value={parentCategoryId} onChange={(e) => handleParentChange(e.target.value)} className={inputClass} required>
            <option value="">Select category</option>
            {categoryTree.parents.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Subcategory</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass} required disabled={!parentCategoryId}>
            <option value="">Select subcategory</option>
            {subcategoriesForParent.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputClass} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Long Description</label>
        <textarea value={longDescription} onChange={(e) => setLongDescription(e.target.value)} rows={6} className={inputClass} />
      </div>

      <ProductSpecsBuilder specs={specs} onChange={setSpecs} />
      <ProductVariantsSection variants={variants} onChange={setVariants} />
      <ProductFeatureToggles flags={featureFlags} onChange={setFeatureFlags} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">SEO Title</label>
          <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Search Keywords</label>
          <input value={searchKeywords} onChange={(e) => setSearchKeywords(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">SEO Description</label>
        <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2} className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Video URL</label>
          <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className={inputClass} placeholder="https://..." />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">YouTube URL</label>
          <input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className={inputClass} placeholder="https://youtube.com/..." />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Internal Notes (admin only)</label>
        <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={2} className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Price (€)</label>
          <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Unit</label>
          <input value={unit} onChange={(e) => setUnit(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Weight (kg)</label>
          <input type="number" step="0.001" min="0" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Stock qty</label>
          <input type="number" min="0" value={stockQty} onChange={(e) => setStockQty(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Inventory Status</label>
        <select value={availability} onChange={(e) => setAvailability(e.target.value as InventoryStatus)} className={inputClass}>
          {INVENTORY_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
          In stock
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active
        </label>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Publish Status</label>
        <select value={publishStatus} onChange={(e) => setPublishStatus(e.target.value as 'draft' | 'published')} className={inputClass}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {!product && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Product image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading || pending} className="text-sm text-slate-700" />
          {imageFile && <p className="mt-1 text-xs text-slate-600">Selected: {imageFile.name} (uploads after save)</p>}
        </div>
      )}

      {product && (
        <>
          <ProductImagesSection productId={product.id} images={product.images ?? []} />
          <ProductDocumentsSection productId={product.id} documents={product.documents ?? []} />
        </>
      )}

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={pending || uploading}
        className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {pending || uploading ? 'Saving…' : product ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  );
}
