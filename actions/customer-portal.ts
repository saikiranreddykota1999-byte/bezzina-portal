'use server';

import type { ActionResult } from '@/types/action';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth/server-session';
import { productIdSchema } from '@/lib/security/bulk-ids';
import { enforceRateLimit, getClientIp } from '@/lib/security/rate-limit';

const addressSchema = z.object({
  label: z.string().trim().min(1).max(64).default('Primary'),
  line1: z.string().trim().min(1).max(256),
  line2: z.string().trim().max(256).optional(),
  city: z.string().trim().min(1).max(128),
  postal_code: z.string().trim().max(32).optional(),
  country: z.string().trim().min(1).max(64).default('Malta'),
  is_default: z.boolean().default(false),
});


function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function getUserAddresses() {
  try {
    const session = await getAuthenticatedUser();
    if (!session.user) return { success: false as const, error: 'Sign in required' };

    const { data, error } = await session.supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', session.user.id)
      .order('is_default', { ascending: false });

    if (error) return { success: false as const, error: error.message };
    return { success: true as const, data: data ?? [] };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Failed to load addresses',
    };
  }
}

export async function saveUserAddress(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getAuthenticatedUser();
    if (!session.user) return { success: false, error: 'Sign in required' };

    const parsed = addressSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

    if (parsed.data.is_default) {
      await session.supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', session.user.id);
    }

    const { data, error } = await session.supabase
      .from('user_addresses')
      .insert({ ...parsed.data, user_id: session.user.id })
      .select('id')
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath('/account/addresses');
    return { success: true, data: { id: data.id } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to save address' };
  }
}

export async function deleteUserAddress(id: string): Promise<ActionResult> {
  try {
    const session = await getAuthenticatedUser();
    if (!session.user) return { success: false, error: 'Sign in required' };

    const { error } = await session.supabase
      .from('user_addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) return { success: false, error: error.message };
    revalidatePath('/account/addresses');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete address' };
  }
}

export async function getCustomerNotifications() {
  try {
    const session = await getAuthenticatedUser();
    if (!session.user) return { success: false as const, error: 'Sign in required' };

    const { data, error } = await session.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return { success: false as const, error: error.message };
    return { success: true as const, data: data ?? [] };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Failed to load notifications',
    };
  }
}

export async function markCustomerNotificationRead(id: string): Promise<ActionResult> {
  try {
    const session = await getAuthenticatedUser();
    if (!session.user) return { success: false, error: 'Sign in required' };

    const { error } = await session.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) return { success: false, error: error.message };
    revalidatePath('/account/notifications');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update' };
  }
}

export async function recordProductView(productId: string): Promise<void> {
  const parsed = productIdSchema.safeParse(productId);
  if (!parsed.success) return;

  try {
    const session = await getAuthenticatedUser();
    const supabase = session.supabase;
    const ip = (await getClientIp()) ?? 'unknown';
    const identifier = `${ip}:${session.user?.id ?? 'anon'}:${parsed.data}`;
    const allowed = await enforceRateLimit({
      action: 'product_view',
      identifier,
      maxAttempts: 30,
      windowMinutes: 10,
    });
    if (!allowed) return;

    await supabase.from('product_views').insert({
      user_id: session.user?.id ?? null,
      product_id: parsed.data,
    });

    const { data: product } = await supabase
      .from('products')
      .select('view_count')
      .eq('id', parsed.data)
      .is('deleted_at', null)
      .maybeSingle();

    if (!product) return;

    await supabase
      .from('products')
      .update({ view_count: (product.view_count ?? 0) + 1 })
      .eq('id', parsed.data);
  } catch (error) {
    console.error('record_product_view_failed', error);
  }
}

export type RecentlyViewedProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  image_url: string | null;
  viewed_at: string;
};

export async function getRecentlyViewedProducts(limit = 12) {
  try {
    const session = await getAuthenticatedUser();
    if (!session.user) return { success: false as const, error: 'Sign in required' };

    const { data, error } = await session.supabase
      .from('product_views')
      .select('viewed_at, product:products(id, name, slug, sku, image_url)')
      .eq('user_id', session.user.id)
      .order('viewed_at', { ascending: false })
      .limit(50);

    if (error) return { success: false as const, error: error.message };

    const seen = new Set<string>();
    const products: RecentlyViewedProduct[] = [];

    for (const row of data ?? []) {
      const product = unwrapRelation(
        row.product as unknown as { id: string; name: string; slug: string; sku: string; image_url: string | null } | { id: string; name: string; slug: string; sku: string; image_url: string | null }[] | null,
      );
      if (!product?.id || seen.has(product.id)) continue;
      seen.add(product.id);
      products.push({ ...product, viewed_at: row.viewed_at as string });
      if (products.length >= limit) break;
    }

    return { success: true as const, data: products };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Failed to load recently viewed',
    };
  }
}

export type CustomerDownload = {
  id: string;
  label: string;
  doc_type: string;
  url: string;
  file_name: string;
  product_name: string;
  product_slug: string;
};

export async function getCustomerDownloads() {
  try {
    const session = await getAuthenticatedUser();
    if (!session.user) return { success: false as const, error: 'Sign in required' };

    const recent = await getRecentlyViewedProducts(30);
    const productIds = recent.success ? recent.data.map((p) => p.id) : [];

    if (productIds.length === 0) {
      return { success: true as const, data: [] as CustomerDownload[] };
    }

    const { data, error } = await session.supabase
      .from('product_documents')
      .select('id, label, doc_type, url, file_name, product:products(name, slug)')
      .in('product_id', productIds)
      .order('sort_order', { ascending: true });

    if (error) return { success: false as const, error: error.message };

    const downloads: CustomerDownload[] = (data ?? []).map((doc) => {
      const product = unwrapRelation(
        doc.product as unknown as { name: string; slug: string } | { name: string; slug: string }[] | null,
      );
      return {
        id: doc.id as string,
        label: doc.label as string,
        doc_type: doc.doc_type as string,
        url: doc.url as string,
        file_name: doc.file_name as string,
        product_name: product?.name ?? 'Product',
        product_slug: product?.slug ?? '',
      };
    });

    return { success: true as const, data: downloads };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Failed to load downloads',
    };
  }
}
