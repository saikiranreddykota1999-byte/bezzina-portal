'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth/server-session';
import { hasPermission } from '@/lib/auth/permissions';
import { canPerformStatusTransition } from '@/lib/auth/oms-status-permissions';
import { logActivity } from '@/services/activity-log.service';
import {
  appendOrderTimeline,
  buildTimelineEntry,
  canTransitionOrder,
  getOmsOrderById,
  listOmsOrders,
  recordStatusHistory,
} from '@/services/oms-order.service';
import {
  deductInventoryForOrder,
  releaseInventoryForOrder,
  reserveInventoryForOrder,
} from '@/services/inventory.service';
import {
  notifyOrderStatusChange,
  notifySalesmanReady,
  notifyWarehouseQueue,
} from '@/services/oms-notification.service';
import { updateOmsStatusSchema } from '@/lib/validators/oms';
import type { OmsOrderFilters, PaginatedOmsOrders } from '@/types/oms';
import type { OmsOrder } from '@/types/oms';
import type { ActionResult } from '@/types/pickup';

export async function getOmsOrdersAction(
  filters: OmsOrderFilters = {},
): Promise<ActionResult<PaginatedOmsOrders>> {
  try {
    const { supabase } = await requirePermission('orders:view');
    const result = await listOmsOrders(supabase, filters);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load orders',
    };
  }
}

export async function getOmsOrderAction(orderId: string): Promise<ActionResult<OmsOrder>> {
  try {
    const { supabase } = await requirePermission('orders:view');
    const order = await getOmsOrderById(supabase, orderId);
    if (!order) return { success: false, error: 'Order not found' };
    return { success: true, data: order };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load order',
    };
  }
}

export async function updateOmsOrderStatusAction(
  input: unknown,
): Promise<ActionResult<OmsOrder>> {
  try {
    const parsed = updateOmsStatusSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid status update' };
    }

    const { supabase, user, profile } = await requirePermission('orders:view');
    const role = profile?.role ?? null;

    if (!canPerformStatusTransition(role, parsed.data.toStatus, hasPermission)) {
      return { success: false, error: 'You do not have permission for this status change' };
    }

    const order = await getOmsOrderById(supabase, parsed.data.orderId);
    if (!order) return { success: false, error: 'Order not found' };

    if (!canTransitionOrder(order, parsed.data.toStatus)) {
      return { success: false, error: 'Invalid status transition for this order type' };
    }

    const fromStatus = order.oms_status;
    const actorName = profile?.full_name ?? user!.email ?? 'Staff';
    const updatePayload: Record<string, unknown> = {
      oms_status: parsed.data.toStatus,
      status: mapLegacyStatus(parsed.data.toStatus, order.fulfillment_method),
    };

    if (parsed.data.toStatus === 'approved') {
      updatePayload.approved_at = new Date().toISOString();
      updatePayload.approved_by = user!.id;
    }

    if (parsed.data.toStatus === 'rejected') {
      updatePayload.rejection_reason = parsed.data.rejectionReason ?? 'other';
      updatePayload.rejection_note = parsed.data.rejectionNote ?? null;
      await releaseInventoryForOrder(supabase, order.id, user!.id);
    }

    if (parsed.data.toStatus === 'cancelled') {
      await releaseInventoryForOrder(supabase, order.id, user!.id);
    }

    if (parsed.data.toStatus === 'approved' && order.items?.length) {
      await reserveInventoryForOrder(
        supabase,
        order.id,
        order.items
          .filter((item) => item.product_id)
          .map((item) => ({
            productId: item.product_id!,
            variantId: item.variant_id,
            quantity: item.quantity,
            warehouseId: order.warehouse_id ?? undefined,
          })),
        user!.id,
      );
    }

    if (parsed.data.toStatus === 'completed' && order.items?.length) {
      await deductInventoryForOrder(
        supabase,
        order.id,
        order.items
          .filter((item) => item.product_id)
          .map((item) => ({
            productId: item.product_id!,
            variantId: item.variant_id,
            quantity: item.quantity,
            warehouseId: order.warehouse_id ?? undefined,
          })),
        user!.id,
      );
    }

    if (
      parsed.data.toStatus === 'ready_for_collection' ||
      parsed.data.toStatus === 'ready_for_delivery'
    ) {
      if (order.fulfillment_method === 'store_pickup') {
        updatePayload.pickup_status = 'ready_for_pickup';
      }
      await notifySalesmanReady(order.assigned_salesman_id, order.order_number, order.id, parsed.data.toStatus);
    }

    if (parsed.data.toStatus === 'collected') {
      updatePayload.pickup_status = 'collected';
    }

    if (parsed.data.toStatus === 'sent_to_warehouse') {
      await notifyWarehouseQueue(order.order_number, order.id);
    }

    const { error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', order.id);

    if (error) return { success: false, error: error.message };

    const timelineEntry = buildTimelineEntry(
      parsed.data.toStatus,
      user!.id,
      actorName,
      parsed.data.note,
    );

    await Promise.all([
      appendOrderTimeline(supabase, order.id, timelineEntry),
      recordStatusHistory(supabase, {
        orderId: order.id,
        fromStatus,
        toStatus: parsed.data.toStatus,
        actorId: user!.id,
        note: parsed.data.note,
        metadata: {
          rejection_reason: parsed.data.rejectionReason,
        },
      }),
      notifyOrderStatusChange({
        orderId: order.id,
        orderNumber: order.order_number,
        customerUserId: order.user_id,
        toStatus: parsed.data.toStatus,
        note: parsed.data.note,
        actorId: user!.id,
      }),
      logActivity({
        userId: user!.id,
        action: 'order_status_update',
        entity: 'order',
        entityId: order.id,
        newValue: { oms_status: parsed.data.toStatus },
        oldValue: { oms_status: fromStatus },
      }),
    ]);

    revalidatePath('/admin/orders');
    revalidatePath('/admin/warehouse');
    revalidatePath('/admin/sales');
    revalidatePath('/admin/delivery');

    const updated = await getOmsOrderById(supabase, order.id);
    return { success: true, data: updated! };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order status',
    };
  }
}

function mapLegacyStatus(
  omsStatus: string,
  fulfillmentMethod: 'delivery' | 'store_pickup',
): string {
  if (omsStatus === 'out_for_delivery' || omsStatus === 'ready_for_delivery') return 'shipped';
  if (omsStatus === 'delivered' || omsStatus === 'completed' || omsStatus === 'collected') {
    return 'delivered';
  }
  if (omsStatus === 'cancelled' || omsStatus === 'rejected') return 'cancelled';
  if (fulfillmentMethod === 'store_pickup' && omsStatus === 'ready_for_collection') {
    return 'ready_for_pickup';
  }
  return 'confirmed';
}
