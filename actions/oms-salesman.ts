'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth/server-session';
import { generateOrderNumber } from '@/lib/pickup/code';
import { createWalkInOrderSchema, barcodeLookupSchema } from '@/lib/validators/oms';
import { lookupBarcode } from '@/services/inventory.service';
import { getDefaultWarehouseId } from '@/services/inventory.service';
import { buildTimelineEntry, appendOrderTimeline, recordStatusHistory } from '@/services/oms-order.service';
import { notifyOmsRoles } from '@/services/oms-notification.service';
import { logActivity } from '@/services/activity-log.service';
import type { ActionResult } from '@/types/pickup';
import type { BarcodeLookupResult, OmsOrder } from '@/types/oms';

export async function lookupBarcodeAction(
  input: unknown,
): Promise<ActionResult<BarcodeLookupResult>> {
  try {
    const parsed = barcodeLookupSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid barcode' };
    }

    const { supabase } = await requirePermission('sales:operate');
    const result = await lookupBarcode(supabase, parsed.data.barcode);
    if (!result) return { success: false, error: 'No product found for this barcode' };
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Barcode lookup failed',
    };
  }
}

export async function createWalkInOrderAction(
  input: unknown,
): Promise<ActionResult<{ orderId: string; orderNumber: string }>> {
  try {
    const parsed = createWalkInOrderSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid walk-in order' };
    }

    const { supabase, user, profile } = await requirePermission('sales:operate');
    const payload = parsed.data;
    const orderNumber = generateOrderNumber();
    const warehouseId = payload.warehouseId ?? (await getDefaultWarehouseId(supabase));

    const productIds = [...new Set(payload.items.map((item) => item.productId))];
    const { data: products } = await supabase
      .from('products')
      .select('id, price')
      .in('id', productIds);

    const variantIds = payload.items
      .map((item) => item.variantId)
      .filter((id): id is string => Boolean(id));
    const { data: variants } = variantIds.length
      ? await supabase.from('product_variants').select('id, price').in('id', variantIds)
      : { data: [] as { id: string; price: number | null }[] };

    const priceByProduct = new Map((products ?? []).map((p) => [p.id, p.price]));
    const priceByVariant = new Map((variants ?? []).map((v) => [v.id, v.price]));

    const pricedItems = payload.items.map((item) => {
      const serverPrice =
        (item.variantId ? priceByVariant.get(item.variantId) : null) ??
        priceByProduct.get(item.productId) ??
        item.unitPrice ??
        0;
      return { ...item, unitPrice: serverPrice };
    });

    const subtotal = pricedItems.reduce(
      (sum, item) => sum + (item.unitPrice ?? 0) * item.quantity,
      0,
    );

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: payload.customerId ?? user!.id,
        order_number: orderNumber,
        status: 'confirmed',
        oms_status: 'draft',
        order_source: 'walk_in',
        fulfillment_method: 'store_pickup',
        subtotal,
        shipping_cost: 0,
        total: subtotal,
        warehouse_id: warehouseId,
        assigned_salesman_id: user!.id,
        payment_status: 'pending',
        payment_method: 'walk_in',
        customer_name: payload.customerName,
        customer_phone: payload.customerPhone ?? null,
        customer_email: payload.customerEmail ?? null,
        customer_company_name: payload.customerCompany ?? null,
        pickup_status: 'scheduled',
      })
      .select('id, order_number')
      .single();

    if (orderError || !order) {
      return { success: false, error: orderError?.message ?? 'Failed to create walk-in order' };
    }

    const { error: itemsError } = await supabase.from('order_items').insert(
      pricedItems.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId ?? null,
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice ?? null,
      })),
    );

    if (itemsError) {
      return { success: false, error: itemsError.message };
    }

    const actorName = profile?.full_name ?? user!.email ?? 'Salesman';
    const entry = buildTimelineEntry('draft', user!.id, actorName, payload.note);

    await Promise.all([
      appendOrderTimeline(supabase, order.id, entry),
      recordStatusHistory(supabase, {
        orderId: order.id,
        fromStatus: null,
        toStatus: 'draft',
        actorId: user!.id,
        note: payload.note,
      }),
      notifyOmsRoles(['sales_manager', 'warehouse_manager', 'admin', 'super_admin'], {
        type: 'order_update',
        title: `Walk-in order ${orderNumber} created`,
        body: `${payload.customerName} — ${payload.items.length} line(s)`,
        link: `/admin/orders/${order.id}`,
        metadata: { order_id: order.id },
      }),
      logActivity({
        userId: user!.id,
        action: 'walk_in_order_created',
        entity: 'order',
        entityId: order.id,
        newValue: { order_number: orderNumber },
      }),
    ]);

    revalidatePath('/admin/sales');
    revalidatePath('/admin/orders');

    return {
      success: true,
      data: { orderId: order.id, orderNumber: order.order_number },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create walk-in order',
    };
  }
}

export async function approveWalkInOrderAction(orderId: string): Promise<ActionResult<OmsOrder>> {
  const { updateOmsOrderStatusAction } = await import('@/actions/oms-orders');
  return updateOmsOrderStatusAction({ orderId, toStatus: 'approved' });
}
