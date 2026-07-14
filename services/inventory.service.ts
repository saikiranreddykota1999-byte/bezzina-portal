import type { SupabaseClient } from '@supabase/supabase-js';
import type { BarcodeLookupResult, InventoryLevel, ProductLocation } from '@/types/oms';

type ReserveItem = {
  productId: string;
  variantId?: string | null;
  quantity: number;
  warehouseId?: string;
};

export async function getDefaultWarehouseId(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase
    .from('warehouses')
    .select('id')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error('No active warehouse configured');
  return data.id;
}

export async function getOrCreateInventoryLevel(
  supabase: SupabaseClient,
  input: {
    productId?: string | null;
    variantId?: string | null;
    warehouseId: string;
  },
): Promise<InventoryLevel> {
  let query = supabase
    .from('inventory_levels')
    .select('*')
    .eq('warehouse_id', input.warehouseId);

  if (input.variantId) {
    query = query.eq('variant_id', input.variantId);
  } else if (input.productId) {
    query = query.eq('product_id', input.productId).is('variant_id', null);
  }

  const { data: existing } = await query.maybeSingle();
  if (existing) return existing as InventoryLevel;

  const { data, error } = await supabase
    .from('inventory_levels')
    .insert({
      product_id: input.productId ?? null,
      variant_id: input.variantId ?? null,
      warehouse_id: input.warehouseId,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as InventoryLevel;
}

export async function reserveInventoryForOrder(
  supabase: SupabaseClient,
  orderId: string,
  items: ReserveItem[],
  actorId: string,
): Promise<void> {
  for (const item of items) {
    const warehouseId = item.warehouseId ?? (await getDefaultWarehouseId(supabase));
    const level = await getOrCreateInventoryLevel(supabase, {
      productId: item.variantId ? null : item.productId,
      variantId: item.variantId ?? null,
      warehouseId,
    });

    if (level.available_stock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.productId}`);
    }

    const { error: updateError } = await supabase
      .from('inventory_levels')
      .update({
        reserved_stock: level.reserved_stock + item.quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', level.id);

    if (updateError) throw new Error(updateError.message);

    await supabase.from('inventory_transactions').insert({
      inventory_level_id: level.id,
      order_id: orderId,
      transaction_type: 'reserve',
      quantity: item.quantity,
      actor_id: actorId,
      note: 'Reserved on order approval',
    });
  }
}

export async function deductInventoryForOrder(
  supabase: SupabaseClient,
  orderId: string,
  items: ReserveItem[],
  actorId: string,
): Promise<void> {
  for (const item of items) {
    const warehouseId = item.warehouseId ?? (await getDefaultWarehouseId(supabase));
    const level = await getOrCreateInventoryLevel(supabase, {
      productId: item.variantId ? null : item.productId,
      variantId: item.variantId ?? null,
      warehouseId,
    });

    const { error: updateError } = await supabase
      .from('inventory_levels')
      .update({
        current_stock: Math.max(0, level.current_stock - item.quantity),
        reserved_stock: Math.max(0, level.reserved_stock - item.quantity),
        updated_at: new Date().toISOString(),
      })
      .eq('id', level.id);

    if (updateError) throw new Error(updateError.message);

    await supabase.from('inventory_transactions').insert({
      inventory_level_id: level.id,
      order_id: orderId,
      transaction_type: 'deduct',
      quantity: item.quantity,
      actor_id: actorId,
      note: 'Deducted on order completion',
    });
  }
}

export async function releaseInventoryForOrder(
  supabase: SupabaseClient,
  orderId: string,
  actorId: string,
): Promise<void> {
  const { data: transactions } = await supabase
    .from('inventory_transactions')
    .select('inventory_level_id, quantity')
    .eq('order_id', orderId)
    .eq('transaction_type', 'reserve');

  for (const tx of transactions ?? []) {
    const { data: level } = await supabase
      .from('inventory_levels')
      .select('reserved_stock')
      .eq('id', tx.inventory_level_id)
      .single();

    if (!level) continue;

    await supabase
      .from('inventory_levels')
      .update({
        reserved_stock: Math.max(0, level.reserved_stock - tx.quantity),
        updated_at: new Date().toISOString(),
      })
      .eq('id', tx.inventory_level_id);

    await supabase.from('inventory_transactions').insert({
      inventory_level_id: tx.inventory_level_id,
      order_id: orderId,
      transaction_type: 'release',
      quantity: tx.quantity,
      actor_id: actorId,
      note: 'Released on order rejection/cancellation',
    });
  }
}

export async function lookupBarcode(
  supabase: SupabaseClient,
  barcode: string,
): Promise<BarcodeLookupResult | null> {
  const normalized = barcode.trim();

  const { data: variant } = await supabase
    .from('product_variants')
    .select('id, product_id, sku, name, barcode, price, in_stock')
    .eq('barcode', normalized)
    .maybeSingle();

  if (variant) {
    const { data: location } = await supabase
      .from('product_locations')
      .select('*, warehouse:warehouses(code, name)')
      .eq('variant_id', variant.id)
      .limit(1)
      .maybeSingle();

    const { data: inventory } = await supabase
      .from('inventory_levels')
      .select('*, warehouse:warehouses(code, name)')
      .eq('variant_id', variant.id)
      .limit(1)
      .maybeSingle();

    return {
      type: 'variant',
      id: variant.id,
      productId: variant.product_id,
      sku: variant.sku,
      name: variant.name,
      barcode: variant.barcode ?? normalized,
      price: variant.price,
      inStock: variant.in_stock,
      location: location as ProductLocation | null,
      inventory: inventory as InventoryLevel | null,
    };
  }

  const { data: product } = await supabase
    .from('products')
    .select('id, sku, name, barcode, price, in_stock')
    .eq('barcode', normalized)
    .maybeSingle();

  if (!product) return null;

  const { data: location } = await supabase
    .from('product_locations')
    .select('*, warehouse:warehouses(code, name)')
    .eq('product_id', product.id)
    .is('variant_id', null)
    .limit(1)
    .maybeSingle();

  const { data: inventory } = await supabase
    .from('inventory_levels')
    .select('*, warehouse:warehouses(code, name)')
    .eq('product_id', product.id)
    .is('variant_id', null)
    .limit(1)
    .maybeSingle();

  return {
    type: 'product',
    id: product.id,
    productId: product.id,
    sku: product.sku,
    name: product.name,
    barcode: product.barcode ?? normalized,
    price: product.price,
    inStock: product.in_stock,
    location: location as ProductLocation | null,
    inventory: inventory as InventoryLevel | null,
  };
}

export async function listLowStockLevels(
  supabase: SupabaseClient,
  limit = 20,
): Promise<InventoryLevel[]> {
  const { data, error } = await supabase
    .from('inventory_levels')
    .select('*, warehouse:warehouses(code, name), product:products(id, name, sku, barcode), variant:product_variants(id, name, sku, barcode)')
    .order('available_stock', { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as InventoryLevel[];
}
