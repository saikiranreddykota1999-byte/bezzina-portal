'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAuthenticatedUser } from '@/lib/auth/server-session';
import { logServerError, toUserError } from '@/lib/security/sanitize-error';
import type { ActionResult } from '@/types/action';
import type { WishlistItem } from '@/types/user';

const wishlistItemSchema = z.object({
  productId: z.string().min(1).max(80),
  slug: z.string().min(1).max(200),
  name: z.string().min(1).max(300),
  sku: z.string().min(1).max(120),
  price: z.number().nullable(),
  image_url: z.string().nullable(),
});

type WishlistRow = {
  product_id: string;
  slug: string;
  name: string;
  sku: string;
  price: number | null;
  image_url: string | null;
  added_at: string;
};

function mapRow(row: WishlistRow): WishlistItem {
  return {
    productId: row.product_id,
    slug: row.slug,
    name: row.name,
    sku: row.sku,
    price: row.price,
    image_url: row.image_url,
    addedAt: row.added_at,
  };
}

export async function getWishlistAction(): Promise<ActionResult<WishlistItem[]>> {
  try {
    const { supabase, user } = await requireAuthenticatedUser();
    const { data, error } = await supabase
      .from('wishlists')
      .select('product_id, slug, name, sku, price, image_url, added_at')
      .eq('user_id', user!.id)
      .order('added_at', { ascending: false });

    if (error) {
      logServerError('getWishlistAction', error);
      return { success: false, error: toUserError(error) };
    }

    return { success: true, data: ((data ?? []) as WishlistRow[]).map(mapRow) };
  } catch (error) {
    logServerError('getWishlistAction', error);
    return { success: false, error: toUserError(error) };
  }
}

export async function toggleWishlistAction(
  input: unknown,
): Promise<ActionResult<{ items: WishlistItem[]; added: boolean }>> {
  try {
    const parsed = wishlistItemSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid wishlist item' };
    }

    const { supabase, user } = await requireAuthenticatedUser();
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user!.id)
      .eq('product_id', parsed.data.productId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user!.id)
        .eq('product_id', parsed.data.productId);
      if (error) {
        logServerError('toggleWishlistAction.delete', error);
        return { success: false, error: toUserError(error) };
      }
    } else {
      const { error } = await supabase.from('wishlists').insert({
        user_id: user!.id,
        product_id: parsed.data.productId,
        slug: parsed.data.slug,
        name: parsed.data.name,
        sku: parsed.data.sku,
        price: parsed.data.price,
        image_url: parsed.data.image_url,
      });
      if (error) {
        logServerError('toggleWishlistAction.insert', error);
        return { success: false, error: toUserError(error) };
      }
    }

    const list = await getWishlistAction();
    if (!list.success) return list;

    revalidatePath('/account/wishlist');
    return {
      success: true,
      data: { items: list.data ?? [], added: !existing },
    };
  } catch (error) {
    logServerError('toggleWishlistAction', error);
    return { success: false, error: toUserError(error) };
  }
}

export async function removeWishlistItemAction(
  productId: string,
): Promise<ActionResult<WishlistItem[]>> {
  try {
    const id = z.string().min(1).max(80).safeParse(productId);
    if (!id.success) return { success: false, error: 'Invalid product' };

    const { supabase, user } = await requireAuthenticatedUser();
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user!.id)
      .eq('product_id', id.data);

    if (error) {
      logServerError('removeWishlistItemAction', error);
      return { success: false, error: toUserError(error) };
    }

    const list = await getWishlistAction();
    if (!list.success) return list;
    revalidatePath('/account/wishlist');
    return { success: true, data: list.data ?? [] };
  } catch (error) {
    logServerError('removeWishlistItemAction', error);
    return { success: false, error: toUserError(error) };
  }
}

/** Merges guest localStorage items into the signed-in account wishlist. */
export async function syncWishlistAction(
  input: unknown,
): Promise<ActionResult<WishlistItem[]>> {
  try {
    const parsed = z.array(wishlistItemSchema).max(100).safeParse(input);
    if (!parsed.success) {
      return { success: false, error: 'Invalid wishlist payload' };
    }

    const { supabase, user } = await requireAuthenticatedUser();
    if (parsed.data.length > 0) {
      const rows = parsed.data.map((item) => ({
        user_id: user!.id,
        product_id: item.productId,
        slug: item.slug,
        name: item.name,
        sku: item.sku,
        price: item.price,
        image_url: item.image_url,
      }));

      const { error } = await supabase.from('wishlists').upsert(rows, {
        onConflict: 'user_id,product_id',
        ignoreDuplicates: true,
      });
      if (error) {
        logServerError('syncWishlistAction', error);
        return { success: false, error: toUserError(error) };
      }
    }

    return getWishlistAction();
  } catch (error) {
    logServerError('syncWishlistAction', error);
    return { success: false, error: toUserError(error) };
  }
}
