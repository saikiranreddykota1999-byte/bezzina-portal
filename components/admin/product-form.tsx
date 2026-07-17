'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  createProduct,
  updateProduct,
} from '@/actions/admin-products/crud';
import {
  uploadProductImage,
  saveProductVariants,
} from '@/actions/admin-products/media';
import { ProductImagesSection } from '@/components/admin/product-images-section';
import { ProductDocumentsSection } from '@/components/admin/product-documents-section';
import { Product360Section } from '@/components/admin/product-360-section';
import { ProductRelationsSection } from '@/components/admin/product-relations-section';
import { ProductSpecsBuilder } from '@/components/admin/product-specs-builder';
import { ProductVariantsSection, type VariantDraft } from '@/components/admin/product-variants-section';
import { ProductFeatureToggles } from '@/components/admin/product-feature-toggles';
import { AdminCollapsible } from '@/components/admin/ui/admin-collapsible';
import { AdminCheckbox } from '@/components/admin/ui/admin-checkbox';
import type { Product, TechnicalSpecRow, InventoryStatus } from '@/types/product';
import { INVENTORY_STATUS_OPTIONS, PRODUCT_FEATURE_FLAGS } from '@/types/product';
import type { CategoryTree } from '@/actions/admin-categories';
import {
  adminButtonPrimaryClass,
  adminFileInputClass,
  adminInputClass,
  adminLabelClass,
  adminSubtextClass,
} from '@/components/admin/admin-styles';
import { buildProductCategoryGroups } from '@/lib/catalogue/category-tree';
import { slugify } from '@/lib/utils/slugify';
import {
  parseProductTechnicalSpecs,
  toProductVariantDraft,
} from '@/lib/admin/product-form-utils';

type Props = {
  categoryTree: CategoryTree;
  product?: Product;
};

export function ProductForm({ categoryTree, product }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [name, setName] = useState(product?.name ?? '');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '');
  const [price, setPrice] = useState(product?.price?.toString() ?? '');
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
  const [specs, setSpecs] = useState<TechnicalSpecRow[]>(parseProductTechnicalSpecs(product));
  const [variants, setVariants] = useState<VariantDraft[]>(
    (product?.variants ?? []).map(toProductVariantDraft),
  );
  const [featureFlags, setFeatureFlags] = useState(
    Object.fromEntries(
      PRODUCT_FEATURE_FLAGS.map(({ key }) => [key, Boolean(product?.[key as keyof Product])]),
    ) as Record<(typeof PRODUCT_FEATURE_FLAGS)[number]['key'], boolean>,
  );
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const categoryGroups = useMemo(
    () => buildProductCategoryGroups(categoryTree),
    [categoryTree],
  );

  const hasCategories = categoryGroups.some((group) => group.options.length > 0);

  function handleNameChange(value: string) {
    setName(value);
    if (!product) setSlug(slugify(value));
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
      price: price ? Number(price) : null,
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
    <form onSubmit={handleSave} className="max-w-4xl space-y-4">
      <AdminCollapsible title="Basic Information" defaultOpen>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabelClass}>Name</label>
              <input value={name} onChange={(e) => handleNameChange(e.target.value)} className={adminInputClass} required />
            </div>
            <div>
              <label className={adminLabelClass}>SKU</label>
              <input value={sku} onChange={(e) => setSku(e.target.value)} className={adminInputClass} required />
            </div>
          </div>

          <div>
            <label className={adminLabelClass}>Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className={adminInputClass} required />
          </div>

          <div>
            <label className={adminLabelClass}>Catalogue Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={adminInputClass}
              required
            >
              <option value="">Select category</option>
              {categoryGroups.map((group) => (
                <optgroup key={group.groupLabel} label={group.groupLabel}>
                  {group.options.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {!hasCategories && (
              <p className={`mt-1 text-xs ${adminSubtextClass} !text-[var(--admin-warning)]`}>
                No categories found. Add categories under Admin → Categories, or run migration 016.
              </p>
            )}
          </div>

          <div>
            <label className={adminLabelClass}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={adminInputClass} />
          </div>

          <div>
            <label className={adminLabelClass}>Long Description</label>
            <textarea value={longDescription} onChange={(e) => setLongDescription(e.target.value)} rows={6} className={adminInputClass} />
          </div>
        </div>
      </AdminCollapsible>

      <AdminCollapsible title="Specifications" defaultOpen={false}>
        <ProductSpecsBuilder specs={specs} onChange={setSpecs} />
      </AdminCollapsible>

      <AdminCollapsible title="Variants" defaultOpen={false}>
        <ProductVariantsSection variants={variants} onChange={setVariants} productSku={sku} />
      </AdminCollapsible>

      <AdminCollapsible title="Feature Flags" defaultOpen={false}>
        <ProductFeatureToggles flags={featureFlags} onChange={setFeatureFlags} />
      </AdminCollapsible>

      <AdminCollapsible title="SEO" defaultOpen={false}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabelClass}>SEO Title</label>
              <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={adminInputClass} />
            </div>
            <div>
              <label className={adminLabelClass}>Search Keywords</label>
              <input value={searchKeywords} onChange={(e) => setSearchKeywords(e.target.value)} className={adminInputClass} />
            </div>
          </div>
          <div>
            <label className={adminLabelClass}>SEO Description</label>
            <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2} className={adminInputClass} />
          </div>
        </div>
      </AdminCollapsible>

      <AdminCollapsible title="Media & Notes" defaultOpen={false}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabelClass}>Video URL</label>
              <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className={adminInputClass} placeholder="https://..." />
            </div>
            <div>
              <label className={adminLabelClass}>YouTube URL</label>
              <input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className={adminInputClass} placeholder="https://youtube.com/..." />
            </div>
          </div>
          <div>
            <label className={adminLabelClass}>Internal Notes (admin only)</label>
            <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={2} className={adminInputClass} />
          </div>
        </div>
      </AdminCollapsible>

      <AdminCollapsible title="Pricing & Inventory" defaultOpen>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className={adminLabelClass}>Price (€)</label>
              <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={adminInputClass} />
            </div>
            <div>
              <label className={adminLabelClass}>Unit</label>
              <input value={unit} onChange={(e) => setUnit(e.target.value)} className={adminInputClass} />
            </div>
            <div>
              <label className={adminLabelClass}>Weight (kg)</label>
              <input type="number" step="0.001" min="0" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className={adminInputClass} />
            </div>
            <div>
              <label className={adminLabelClass}>Stock qty</label>
              <input type="number" min="0" value={stockQty} onChange={(e) => setStockQty(e.target.value)} className={adminInputClass} />
            </div>
          </div>

          <div>
            <label className={adminLabelClass}>Inventory Status</label>
            <select value={availability} onChange={(e) => setAvailability(e.target.value as InventoryStatus)} className={adminInputClass}>
              {INVENTORY_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-6">
            <AdminCheckbox id="in-stock" checked={inStock} onChange={setInStock} label="In stock" />
            <AdminCheckbox id="is-active" checked={isActive} onChange={setIsActive} label="Active" />
          </div>

          <div>
            <label className={adminLabelClass}>Publish Status</label>
            <select value={publishStatus} onChange={(e) => setPublishStatus(e.target.value as 'draft' | 'published')} className={adminInputClass}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </AdminCollapsible>

      <AdminCollapsible title={product ? 'Gallery & Documents' : 'Product Image'} defaultOpen={Boolean(product)}>
        <div className="space-y-4">
          {!product && (
            <div>
              <label className={adminLabelClass}>Product image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading || pending}
                className={adminFileInputClass}
              />
              {imageFile && (
                <p className={`mt-1 text-xs ${adminSubtextClass}`}>
                  Selected: {imageFile.name} (uploads after save)
                </p>
              )}
            </div>
          )}

          {product && (
            <>
              <ProductImagesSection productId={product.id} images={product.images ?? []} />
              <ProductDocumentsSection productId={product.id} documents={product.documents ?? []} />
              <Product360Section productId={product.id} frames={product.spin_frames ?? []} />
              <ProductRelationsSection productId={product.id} />
            </>
          )}
        </div>
      </AdminCollapsible>

      {error && <p className="text-sm text-[var(--admin-danger)]" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={pending || uploading}
        className={adminButtonPrimaryClass}
      >
        {pending || uploading ? 'Saving…' : product ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  );
}
