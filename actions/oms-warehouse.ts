'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth/server-session';
import { getOmsOrdersAction, updateOmsOrderStatusAction } from '@/actions/oms-orders';
import type { ActionResult } from '@/types/pickup';
import type { OmsOrder, PaginatedOmsOrders } from '@/types/oms';
import type { OmsOrderStatus } from '@/config/oms';
import { WAREHOUSE_REJECT_REASONS } from '@/config/oms';

const WAREHOUSE_QUEUE_STATUSES: OmsOrderStatus[] = [
  'sent_to_warehouse',
  'warehouse_accepted',
  'preparing',
  'packed',
  'ready_for_delivery',
  'ready_for_collection',
];

export async function getWarehouseQueueAction(): Promise<ActionResult<PaginatedOmsOrders>> {
  try {
    await requirePermission('warehouse:operate');
    const result = await getOmsOrdersAction({
      omsStatuses: WAREHOUSE_QUEUE_STATUSES,
      pageSize: 200,
      page: 1,
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        error: !result.success ? result.error : 'Failed to load warehouse queue',
      };
    }

    return {
      success: true,
      data: {
        orders: result.data.orders,
        total: result.data.orders.length,
        page: 1,
        pageSize: result.data.orders.length,
        totalPages: 1,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load warehouse queue',
    };
  }
}

export async function acceptWarehouseOrderAction(orderId: string): Promise<ActionResult<OmsOrder>> {
  return updateOmsOrderStatusAction({ orderId, toStatus: 'warehouse_accepted' });
}

export async function rejectWarehouseOrderAction(input: {
  orderId: string;
  reason: (typeof WAREHOUSE_REJECT_REASONS)[number];
  note?: string;
}): Promise<ActionResult<OmsOrder>> {
  return updateOmsOrderStatusAction({
    orderId: input.orderId,
    toStatus: 'rejected',
    rejectionReason: input.reason,
    rejectionNote: input.note,
  });
}

export async function advanceWarehouseOrderAction(
  orderId: string,
  toStatus: Extract<OmsOrderStatus, 'preparing' | 'packed' | 'ready_for_delivery' | 'ready_for_collection' | 'completed'>,
): Promise<ActionResult<OmsOrder>> {
  const result = await updateOmsOrderStatusAction({ orderId, toStatus });
  if (result.success) revalidatePath('/admin/warehouse');
  return result;
}
