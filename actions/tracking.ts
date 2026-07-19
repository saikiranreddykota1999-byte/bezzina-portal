'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireAuthenticatedUser } from '@/lib/auth/server-session';
import { checkPublicRateLimit } from '@/lib/auth/login-security';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildShipmentFromOrder } from '@/lib/tracking';
import { logServerError, toUserError } from '@/lib/security/sanitize-error';
import type { ActionResult } from '@/types/action';
import type { Shipment } from '@/types/payment';

const querySchema = z
  .string()
  .trim()
  .min(3, 'Enter a tracking number or order ID')
  .max(80)
  .regex(/^[A-Za-z0-9._-]+$/, 'Tracking query contains invalid characters');

const publicTrackSchema = z.object({
  query: querySchema,
  email: z.string().trim().email('Enter the email used on the order'),
});

type OrderTrackRow = {
  order_number: string | null;
  tracking_number: string | null;
  status: string | null;
  oms_status: string | null;
  fulfillment_method: string | null;
  created_at: string;
  pickup_date: string | null;
  timeline: unknown;
  customer_email: string | null;
  items: { name: string; quantity: number }[] | null;
};

const ORDER_TRACK_SELECT =
  'order_number, tracking_number, status, oms_status, fulfillment_method, created_at, pickup_date, timeline, customer_email, items:order_items(name, quantity)';

function emailsMatch(left: string | null | undefined, right: string): boolean {
  return Boolean(left?.trim() && left.trim().toLowerCase() === right.trim().toLowerCase());
}

async function fetchOrderByQuery(
  client: SupabaseClient,
  rawQuery: string,
  userId?: string,
): Promise<OrderTrackRow | null> {
  const q = rawQuery.trim();
  const variants = [...new Set([q, q.toUpperCase(), q.toLowerCase()])];

  for (const candidate of variants) {
    let byNumber = client
      .from('orders')
      .select(ORDER_TRACK_SELECT)
      .eq('order_number', candidate)
      .limit(1);
    if (userId) byNumber = byNumber.eq('user_id', userId);
    const { data: orderMatch, error: orderError } = await byNumber.maybeSingle();
    if (orderError) {
      logServerError('fetchOrderByQuery.order_number', orderError);
    } else if (orderMatch) {
      return orderMatch as OrderTrackRow;
    }

    let byTracking = client
      .from('orders')
      .select(ORDER_TRACK_SELECT)
      .eq('tracking_number', candidate)
      .limit(1);
    if (userId) byTracking = byTracking.eq('user_id', userId);
    const { data: trackMatch, error: trackError } = await byTracking.maybeSingle();
    if (trackError) {
      logServerError('fetchOrderByQuery.tracking_number', trackError);
    } else if (trackMatch) {
      return trackMatch as OrderTrackRow;
    }
  }

  return null;
}

function toShipment(order: OrderTrackRow): Shipment {
  return buildShipmentFromOrder({
    ...order,
    timeline: Array.isArray(order.timeline) ? order.timeline : [],
  });
}

/**
 * Public tracking requires order reference + matching customer email.
 * Prevents unauthenticated enumeration of orders via the service role.
 */
export async function trackPublicShipmentAction(
  input: unknown,
): Promise<ActionResult<Shipment | null>> {
  try {
    const parsed = publicTrackSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid query' };
    }

    const h = await headers();
    const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const allowed = await checkPublicRateLimit(
      'public_track',
      `${ip}:${parsed.data.email.toLowerCase()}`,
    );
    if (!allowed) {
      return { success: false, error: 'Too many requests. Please try again later.' };
    }

    const admin = createAdminClient();
    const order = await fetchOrderByQuery(admin, parsed.data.query);
    if (!order || !emailsMatch(order.customer_email, parsed.data.email)) {
      // Uniform response — do not reveal whether the order exists.
      return { success: true, data: null };
    }

    return { success: true, data: toShipment(order) };
  } catch (error) {
    logServerError('trackPublicShipmentAction', error);
    return { success: false, error: toUserError(error) };
  }
}

export async function trackAccountShipmentAction(
  input: unknown,
): Promise<ActionResult<Shipment | null>> {
  try {
    const parsed = querySchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid query' };
    }

    const { supabase, user } = await requireAuthenticatedUser();
    const order = await fetchOrderByQuery(supabase, parsed.data, user!.id);
    return { success: true, data: order ? toShipment(order) : null };
  } catch (error) {
    logServerError('trackAccountShipmentAction', error);
    return { success: false, error: toUserError(error) };
  }
}

export async function listAccountShipmentsAction(): Promise<ActionResult<Shipment[]>> {
  try {
    const { supabase, user } = await requireAuthenticatedUser();
    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_TRACK_SELECT)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      logServerError('listAccountShipmentsAction', error);
      return { success: false, error: toUserError(error) };
    }

    return {
      success: true,
      data: ((data ?? []) as OrderTrackRow[]).map(toShipment),
    };
  } catch (error) {
    logServerError('listAccountShipmentsAction', error);
    return { success: false, error: toUserError(error) };
  }
}
