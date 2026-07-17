import type { SupabaseClient } from '@supabase/supabase-js';
import { INDUSTRIAL_TOOLS_CATALOGUE, type CatalogueProductDef } from '@/config/catalogue/industrial-tools';
import { slugify } from '@/lib/utils/slugify';

export type ImportRow = {
  category?: string;
  subcategory?: string;
  product_name: string;
  product_sku?: string;
  variant_name?: string;
  variant_sku?: string;
  description?: string;
  short_description?: string;
  material?: string;
  marine_grade?: boolean | string;
  industrial_grade?: boolean | string;
  search_keywords?: string;
  availability?: string;
};

export type ImportSummary = {
  categoriesCreated: number;
  categoriesUpdated: number;
  productsCreated: number;
  productsUpdated: number;
  variantsCreated: number;
  variantsUpdated: number;
  skipped: number;
  errors: string[];
};

type SchemaFlags = {
  categoryDivision: boolean;
  categoryParentId: boolean;
  productVariants: boolean;
  publishStatus: boolean;
};

function parseBool(value: boolean | string | undefined, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (!value) return fallback;
  const normalized = String(value).trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

export async function detectImportSchema(supabase: SupabaseClient): Promise<SchemaFlags> {
  const [{ error: divErr }, { error: parentErr }, { error: variantErr }, { error: publishErr }] =
    await Promise.all([
      supabase.from('categories').select('division').limit(1),
      supabase.from('categories').select('parent_id').limit(1),
      supabase.from('product_variants').select('id').limit(1),
      supabase.from('products').select('publish_status').limit(1),
    ]);

  return {
    categoryDivision: !divErr,
    categoryParentId: !parentErr,
    productVariants: !variantErr,
    publishStatus: !publishErr,
  };
}

async function upsertCategory(
  supabase: SupabaseClient,
  row: Record<string, unknown>,
  flags: SchemaFlags,
): Promise<string> {
  const payload = { ...row };
  if (!flags.categoryDivision) delete payload.division;
  if (!flags.categoryParentId) delete payload.parent_id;

  const { data, error } = await supabase
    .from('categories')
    .upsert(payload, { onConflict: 'slug' })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

function buildProductSku(code: string, index: number): string {
  return `IE-${code}-${String(index).padStart(3, '0')}`;
}

function buildVariantSku(productSku: string, index: number): string {
  return `${productSku}-V${String(index + 1).padStart(2, '0')}`;
}

function buildProductPayload(
  product: CatalogueProductDef,
  categoryId: string,
  sku: string,
  slug: string,
  flags: SchemaFlags,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    sku,
    name: product.name,
    slug,
    description: `${product.name} — professional grade ${product.subcategoryName.toLowerCase()} for industrial and marine applications.`,
    category_id: categoryId,
    unit: 'each',
    price: null,
    in_stock: true,
    stock_quantity: 0,
    is_active: true,
    availability: 'available',
    material: product.material ?? null,
    marine_grade: product.marineGrade ?? false,
    industrial_grade: product.industrialGrade ?? true,
    recently_added: true,
    search_keywords: [product.name, product.subcategoryName, ...(product.searchKeywords ?? [])].join(', '),
    technical_specs: [
      { property: 'Category', value: product.subcategoryName },
      { property: 'Material', value: product.material ?? 'Industrial Grade' },
      { property: 'Available Sizes', value: product.variants.join(', ') },
    ],
    tags: ['catalogue', slugify(product.subcategoryName)],
  };

  if (flags.publishStatus) payload.publish_status = 'published';
  return payload;
}

export async function importIndustrialToolsCatalogue(
  supabase: SupabaseClient,
): Promise<ImportSummary> {
  const flags = await detectImportSchema(supabase);
  const summary: ImportSummary = {
    categoriesCreated: 0,
    categoriesUpdated: 0,
    productsCreated: 0,
    productsUpdated: 0,
    variantsCreated: 0,
    variantsUpdated: 0,
    skipped: 0,
    errors: [],
  };

  let productCounter = 0;

  for (const root of INDUSTRIAL_TOOLS_CATALOGUE) {
    const parentId = await upsertCategory(
      supabase,
      {
        name: root.name,
        slug: root.slug,
        description: `${root.name} — Joseph Bezzina industrial catalogue`,
        sort_order: 10,
        division: root.division,
        parent_id: null,
      },
      flags,
    );
    summary.categoriesCreated += 1;

    for (const sub of root.subcategories) {
      const subSlug = `${root.slug}-${sub.slug}`;
      await upsertCategory(
        supabase,
        {
          name: sub.name,
          slug: subSlug,
          description: `${sub.name} — ${root.name}`,
          sort_order: 10,
          division: root.division,
          parent_id: parentId,
        },
        flags,
      );
      summary.categoriesCreated += 1;
    }

    for (const product of root.products) {
      productCounter += 1;
      const subSlug = `${root.slug}-${product.subcategorySlug}`;
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', subSlug)
        .maybeSingle();

      if (!category?.id) {
        summary.errors.push(`Missing category ${subSlug} for ${product.name}`);
        continue;
      }

      const sku = buildProductSku(root.code, productCounter);
      const slug = slugify(`${root.slug}-${product.subcategorySlug}-${product.name}`);

      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('sku', sku)
        .maybeSingle();

      const productPayload = buildProductPayload(product, category.id, sku, slug, flags);

      const { data: savedProduct, error: productError } = await supabase
        .from('products')
        .upsert(productPayload, { onConflict: 'sku' })
        .select('id')
        .single();

      if (productError || !savedProduct?.id) {
        summary.errors.push(`Product ${product.name}: ${productError?.message ?? 'save failed'}`);
        continue;
      }

      if (existing?.id) summary.productsUpdated += 1;
      else summary.productsCreated += 1;

      if (!flags.productVariants) continue;

      await supabase.from('product_variants').delete().eq('product_id', savedProduct.id);

      const variantRows = product.variants.map((variantName, index) => ({
        product_id: savedProduct.id,
        name: variantName,
        sku: buildVariantSku(sku, index),
        availability: 'available',
        unit: 'each',
        in_stock: true,
        stock_quantity: 0,
        price: null,
        specification: variantName,
        sort_order: index,
      }));

      const { error: variantError } = await supabase.from('product_variants').insert(variantRows);
      if (variantError) {
        summary.errors.push(`Variants for ${product.name}: ${variantError.message}`);
      } else {
        summary.variantsCreated += variantRows.length;
      }
    }
  }

  return summary;
}

export async function importCatalogueRows(
  supabase: SupabaseClient,
  rows: ImportRow[],
  options: { updateExisting?: boolean } = {},
): Promise<ImportSummary> {
  const flags = await detectImportSchema(supabase);
  const updateExisting = options.updateExisting ?? true;
  const summary: ImportSummary = {
    categoriesCreated: 0,
    categoriesUpdated: 0,
    productsCreated: 0,
    productsUpdated: 0,
    variantsCreated: 0,
    variantsUpdated: 0,
    skipped: 0,
    errors: [],
  };

  const categoryCache = new Map<string, string>();
  const productCache = new Map<string, string>();

  async function ensureCategory(name: string, parentSlug?: string): Promise<string | null> {
    const slug = slugify(name);
    const cacheKey = parentSlug ? `${parentSlug}/${slug}` : slug;
    if (categoryCache.has(cacheKey)) return categoryCache.get(cacheKey) ?? null;

    let parentId: string | null = null;
    if (parentSlug) {
      parentId = await ensureCategory(parentSlug);
    }

    const payload: Record<string, unknown> = {
      name,
      slug: parentSlug ? `${slugify(parentSlug)}-${slug}` : slug,
      description: name,
      sort_order: 10,
      parent_id: parentId,
      division: 'industrial',
    };

    const id = await upsertCategory(supabase, payload, flags);
    categoryCache.set(cacheKey, id);
    summary.categoriesCreated += 1;
    return id;
  }

  for (const row of rows) {
    const productName = row.product_name?.trim();
    if (!productName) {
      summary.skipped += 1;
      continue;
    }

    try {
      const categoryName = row.category?.trim() || 'Imported';
      const subcategoryName = row.subcategory?.trim() || 'General';
      await ensureCategory(categoryName);
      const categoryId = await ensureCategory(subcategoryName, categoryName);
      if (!categoryId) throw new Error('Category resolution failed');

      const productSku = row.product_sku?.trim() || `IMP-${slugify(productName).slice(0, 24)}`;
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('sku', productSku)
        .maybeSingle();

      if (existingProduct?.id && !updateExisting) {
        summary.skipped += 1;
        productCache.set(productSku, existingProduct.id);
        continue;
      }

      const productPayload: Record<string, unknown> = {
        sku: productSku,
        name: productName,
        slug: slugify(`${categoryName}-${subcategoryName}-${productName}`),
        description: row.description?.trim() || row.short_description?.trim() || productName,
        category_id: categoryId,
        unit: 'each',
        price: null,
        in_stock: true,
        stock_quantity: 0,
        is_active: true,
        availability: row.availability?.trim() || 'available',
        material: row.material?.trim() || null,
        marine_grade: parseBool(row.marine_grade),
        industrial_grade: parseBool(row.industrial_grade, true),
        search_keywords: row.search_keywords?.trim() || productName,
      };
      if (flags.publishStatus) productPayload.publish_status = 'published';

      const { data: savedProduct, error } = await supabase
        .from('products')
        .upsert(productPayload, { onConflict: 'sku' })
        .select('id')
        .single();

      if (error || !savedProduct?.id) throw new Error(error?.message ?? 'Product save failed');

      if (existingProduct?.id) summary.productsUpdated += 1;
      else summary.productsCreated += 1;
      productCache.set(productSku, savedProduct.id);

      const variantName = row.variant_name?.trim();
      if (!variantName || !flags.productVariants) continue;

      const variantSku = row.variant_sku?.trim() || `${productSku}-${slugify(variantName)}`;
      const { data: existingVariant } = await supabase
        .from('product_variants')
        .select('id')
        .eq('sku', variantSku)
        .maybeSingle();

      const variantPayload = {
        product_id: savedProduct.id,
        name: variantName,
        sku: variantSku,
        availability: row.availability?.trim() || 'available',
        unit: 'each',
        in_stock: true,
        stock_quantity: 0,
        price: null,
        specification: variantName,
        sort_order: 0,
      };

      const { error: variantError } = await supabase
        .from('product_variants')
        .upsert(variantPayload, { onConflict: 'sku' });

      if (variantError) throw new Error(variantError.message);
      if (existingVariant?.id) summary.variantsUpdated += 1;
      else summary.variantsCreated += 1;
    } catch (error) {
      summary.errors.push(
        `${productName}: ${error instanceof Error ? error.message : 'Import failed'}`,
      );
    }
  }

  return summary;
}
